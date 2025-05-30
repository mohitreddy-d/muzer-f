# Backend Implementation for Dual Spotify Token Security

## Overview

To improve security in the Muzer application, we need to implement a dual-token approach for Spotify authentication:

1. **Streaming Token** - A limited-scope token exposed to the client for Web Playback SDK
2. **Private Token** - A full-scoped token that remains server-side for API operations

This approach separates concerns and minimizes exposure of privileged tokens to the client.

## 1. Spotify OAuth Configuration

### Register Two Applications in Spotify Developer Dashboard

For highest security (optional), register two separate Spotify applications:

1. **Public SDK App**:
   - Request only the `streaming` scope
   - Used only for Web Playback SDK

2. **Private API App**:
   - Request all needed scopes (`user-read-playback-state`, `user-modify-playback-state`, etc.)
   - Keep client secret secure, server-side only

If using a single Spotify app, ensure proper scope handling in the authorization flow.

## 2. Auth Flow Implementation

### Main Authentication Endpoint (existing)

```go
// Initiates the OAuth2 flow with Spotify
func (h *AuthHandler) LoginHandler(c *gin.Context) {
    // Generate state parameter and store in session
    state := generateRandomState()
    session := sessions.Default(c)
    session.Set("oauth_state", state)
    session.Save()

    // Redirect to Spotify authorization with all required scopes
    fullScopes := []string{
        "streaming",                   // Used by SDK
        "user-read-email",
        "user-read-private",
        "user-top-read",               // For top tracks/artists
        "user-read-playback-state",    // Read playback state
        "user-modify-playback-state",  // Control playback
        // Add other scopes as needed
    }

    authURL := spotifyOauth.AuthURL(state, oauth2.SetAuthURLParam("scope", strings.Join(fullScopes, " ")))
    c.Redirect(http.StatusFound, authURL)
}

// Callback handler stores both tokens
func (h *AuthHandler) CallbackHandler(c *gin.Context) {
    // Verify state, exchange code for tokens
    // ...

    // Store the full-scoped token in user's session
    session := sessions.Default(c)
    session.Set("spotify_token", token.AccessToken)
    session.Set("spotify_refresh_token", token.RefreshToken)
    session.Set("spotify_token_expiry", token.Expiry.Unix())
    session.Save()

    // Redirect back to frontend
    c.Redirect(http.StatusFound, h.frontendURL)
}
```

### New Endpoints for Token Access

1. **Private Token Endpoint (existing but protected)**

```go
// GetSpotifyToken returns the full-scoped token (used internally by backend)
func (h *AuthHandler) GetSpotifyToken(c *gin.Context) {
    session := sessions.Default(c)
    tokenData := session.Get("spotify_token")
    if tokenData == nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "No Spotify token found"})
        return
    }

    // Check if token needs refresh
    expiryData := session.Get("spotify_token_expiry")
    if expiryData != nil {
        expiry := expiryData.(int64)
        if time.Now().Unix() > expiry-300 { // Refresh if less than 5 minutes remaining
            // Refresh token logic here
            refreshToken := session.Get("spotify_refresh_token")
            if refreshToken != nil {
                // Use refreshToken to get a new access token
                newToken, err := refreshSpotifyToken(refreshToken.(string))
                if err == nil {
                    session.Set("spotify_token", newToken.AccessToken)
                    session.Set("spotify_token_expiry", newToken.Expiry.Unix())
                    session.Save()
                    tokenData = newToken.AccessToken
                }
            }
        }
    }

    // Don't expose this endpoint to frontend calls!
    // This should be used only by internal backend services
    c.JSON(http.StatusOK, gin.H{"access_token": tokenData.(string)})
}
```

2. **New Streaming-Only Token Endpoint**

```go
// GetSpotifyStreamingToken returns a streaming-only token for the Web Playback SDK
func (h *AuthHandler) GetSpotifyStreamingToken(c *gin.Context) {
    // Get the user's ID from session
    session := sessions.Default(c)
    userID := session.Get("user_id")
    if userID == nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
        return
    }

    // Option 1: Request a new token with only streaming scope
    // This is more secure but requires additional API call
    streamingToken, err := getStreamingScopedToken(c)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get streaming token"})
        return
    }

    // Option 2: Use the existing token (less secure but simpler)
    // streamingToken := session.Get("spotify_token")

    c.JSON(http.StatusOK, gin.H{"access_token": streamingToken.(string)})
}

// Helper to get a streaming-only token
func getStreamingScopedToken(c *gin.Context) (string, error) {
    session := sessions.Default(c)
    refreshToken := session.Get("spotify_refresh_token")
    if refreshToken == nil {
        return "", errors.New("no refresh token available")
    }

    // Use the refresh token to request a new token with only streaming scope
    token, err := spotifyOauth.TokenExchange(
        oauth2.SetAuthURLParam("scope", "streaming"),
        oauth2.SetAuthURLParam("refresh_token", refreshToken.(string)),
        oauth2.SetAuthURLParam("grant_type", "refresh_token"),
    )
    if err != nil {
        return "", err
    }

    return token.AccessToken, nil
}
```

## 3. Player API Endpoints

Create these endpoints to proxy Spotify API calls without exposing the token to the client:

```go
// PlayTrack endpoint
func (h *PlayerHandler) PlayTrack(c *gin.Context) {
    var req struct {
        TrackURI string `json:"trackUri"`
        DeviceID string `json:"deviceId,omitempty"`
    }
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // Get user's full-scoped token
    token, err := h.authService.GetUserToken(c)
    if err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Failed to get Spotify token"})
        return
    }

    // Create a Spotify client with the user's token
    client := spotify.New(token)
    
    // Prepare the play request
    playOptions := &spotify.PlayOptions{
        URIs: []string{req.TrackURI},
    }
    if req.DeviceID != "" {
        playOptions.DeviceID = &req.DeviceID
    }

    // Make the API call
    err = client.PlayOpt(playOptions)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to play track: " + err.Error()})
        return
    }

    c.Status(http.StatusNoContent)
}

// PausePlayback endpoint
func (h *PlayerHandler) PausePlayback(c *gin.Context) {
    var req struct {
        DeviceID string `json:"deviceId,omitempty"`
    }
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    token, err := h.authService.GetUserToken(c)
    if err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Failed to get Spotify token"})
        return
    }

    client := spotify.New(token)
    
    var deviceID *string
    if req.DeviceID != "" {
        deviceID = &req.DeviceID
    }

    err = client.PauseOpt(deviceID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to pause playback: " + err.Error()})
        return
    }

    c.Status(http.StatusNoContent)
}

// GetPlayerState endpoint - Returns the current playback state
func (h *PlayerHandler) GetPlayerState(c *gin.Context) {
    token, err := h.authService.GetUserToken(c)
    if err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Failed to get Spotify token"})
        return
    }

    client := spotify.New(token)
    
    // Get current playback from Spotify
    state, err := client.PlayerState()
    if err != nil {
        // If there is no active player, return a 204 No Content
        if strings.Contains(err.Error(), "No active device found") {
            c.Status(http.StatusNoContent)
            return
        }
        
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get player state: " + err.Error()})
        return
    }
    
    if state == nil {
        c.Status(http.StatusNoContent)
        return
    }
    
    // Return the player state
    c.JSON(http.StatusOK, state)
}

// Implement other player endpoints similarly:
// - SkipToNextTrack
// - SkipToPreviousTrack
// - TransferPlayback
// - SearchTracks
```

## 4. Routes Configuration

Add these routes to your Gin router:

```go
// Auth routes
auth := router.Group("/api/v1/auth")
{
    auth.GET("/login", authHandler.LoginHandler)
    auth.GET("/callback", authHandler.CallbackHandler)
    auth.GET("/spotify_streaming_token", middlewares.RequireAuth(), authHandler.GetSpotifyStreamingToken)
    // Other auth routes...
}

// Player routes
player := router.Group("/api/v1/me/player", middlewares.RequireAuth())
{
    player.GET("/state", playerHandler.GetPlayerState) // New endpoint for getting player state
    player.POST("/play", playerHandler.PlayTrack)
    player.PUT("/pause", playerHandler.PausePlayback)
    player.POST("/next", playerHandler.SkipToNextTrack)
    player.POST("/previous", playerHandler.SkipToPreviousTrack)
    player.PUT("", playerHandler.TransferPlayback)
}

// Search routes
search := router.Group("/api/v1/search", middlewares.RequireAuth())
{
    search.GET("/tracks", searchHandler.SearchTracks)
}
```

## 5. Player State Restoration

To properly restore player state when a user refreshes or returns to the app:

1. **Backend Implementation:**
   - The `/api/v1/me/player/state` endpoint proxies Spotify's current playback state
   - Returns the full state object including current track, progress, device info, etc.
   - Handles cases when no active playback exists

2. **Frontend Implementation:**
   - Fetches player state on app initialization
   - Restores track info, playback position, and play/pause state
   - Sets up progress counter to continue tracking playback time

3. **State Synchronization:**
   - When transferring playback to a new device, synchronize with current state
   - Handle edge cases like no active device or end of track position

## Security Considerations

1. **Session Security**:
   - Use secure, HTTP-only cookies for sessions
   - Implement CSRF protection
   - Enable HTTPS in production

2. **Token Refresh Logic**:
   - Handle token expiration and refresh in middleware
   - Create a service to centralize token management

3. **Error Handling**:
   - Don't expose sensitive information in error messages
   - Log errors for debugging but sanitize logs

4. **Rate Limiting**:
   - Implement rate limiting on API endpoints
   - Consider using Redis for distributed rate limiting

## Testing

1. Test token scope separation:
   - Verify streaming token only has streaming scope
   - Check private token has full permissions

2. Test API functionality:
   - All player endpoints should work with proper authentication
   - Endpoints should reject unauthorized requests

3. Test token refresh:
   - Tokens should automatically refresh when expired
   - Sessions should maintain consistency after refresh

4. Test player state restoration:
   - State should correctly restore after page refresh
   - Progress tracking should continue from the correct position
   - Player UI should reflect the current playback state 