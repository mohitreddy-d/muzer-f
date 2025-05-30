import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Edit3, Mail, MapPin, User, CalendarDays, Bell } from 'lucide-react';

// Dummy data - replace with actual data fetching
const userProfile = {
  username: 'SonicTheHedgehog',
  fullName: 'Sonic Speedster',
  email: 'sonic@greenhill.zone',
  location: 'Green Hill Zone',
  joinedDate: 'June 23, 1991',
  bio: 'Blue hedgehog with a passion for speed and adventure. Always ready to thwart Dr. Eggman\'s evil schemes! Gotta go fast!',
  avatarUrl: 'https://via.placeholder.com/150/EF4444/FFFFFF?Text=S', // Red placeholder
  coverImageUrl: 'https://via.placeholder.com/1000x300/FECACA/1F2937?Text=Profile+Cover', // Lighter red placeholder
  stats: {
    ringsCollected: '9,999,999',
    badniksBusted: '1,234,567',
    zonesCleared: '777',
  },
  recentActivity: [
    { id: 1, action: 'Collected 7 Chaos Emeralds', timestamp: '2 hours ago' },
    { id: 2, action: 'Saved Flicky Island from Dr. Eggman', timestamp: '1 day ago' },
    { id: 3, action: 'Enjoyed a chili dog at Station Square', timestamp: '3 days ago' },
  ],
};

const ProfilePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <Card className="max-w-4xl mx-auto overflow-hidden shadow-xl">
        {/* Cover Image */}
        <div
          className="h-48 md:h-64 bg-cover bg-center"
          style={{ backgroundImage: `url(${userProfile.coverImageUrl})` }}
        >
          {/* You can add content over the cover image if needed */}
        </div>

        <CardHeader className="p-6 items-center flex flex-col md:flex-row text-center md:text-left -mt-20 md:-mt-16">
          <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-background shadow-lg">
            <AvatarImage src={userProfile.avatarUrl} alt={userProfile.username} />
            <AvatarFallback className="text-primary text-4xl">
              {userProfile.username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="mt-4 md:mt-0 md:ml-6">
            <CardTitle className="text-3xl font-bold">{userProfile.username}</CardTitle>
            <CardDescription className="text-lg text-muted-foreground">{userProfile.fullName}</CardDescription>
            <Button variant="outline" size="sm" className="mt-4">
              <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Bio Section */}
          <section className="mb-8">
            <h3 className="text-xl font-semibold mb-2 text-primary">Bio</h3>
            <p className="text-muted-foreground leading-relaxed">
              {userProfile.bio}
            </p>
          </section>

          <Separator className="my-6" />

          {/* Details and Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* User Details */}
            <section>
              <h3 className="text-xl font-semibold mb-4 text-primary flex items-center">
                <User className="mr-2 h-5 w-5" /> Details
              </h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-center">
                  <Mail className="mr-3 h-5 w-5 text-primary/70" />
                  <span>{userProfile.email}</span>
                </li>
                <li className="flex items-center">
                  <MapPin className="mr-3 h-5 w-5 text-primary/70" />
                  <span>{userProfile.location}</span>
                </li>
                <li className="flex items-center">
                  <CalendarDays className="mr-3 h-5 w-5 text-primary/70" />
                  <span>Joined: {userProfile.joinedDate}</span>
                </li>
              </ul>
            </section>

            {/* Stats Section */}
            <section>
              <h3 className="text-xl font-semibold mb-4 text-primary">Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-primary/5 hover:bg-primary/10 transition-colors">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-sm">Rings Collected</CardDescription>
                    <CardTitle className="text-2xl text-primary">{userProfile.stats.ringsCollected}</CardTitle>
                  </CardHeader>
                </Card>
                <Card className="bg-primary/5 hover:bg-primary/10 transition-colors">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-sm">Badniks Busted</CardDescription>
                    <CardTitle className="text-2xl text-primary">{userProfile.stats.badniksBusted}</CardTitle>
                  </CardHeader>
                </Card>
                <Card className="bg-primary/5 hover:bg-primary/10 transition-colors col-span-2">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-sm">Zones Cleared</CardDescription>
                    <CardTitle className="text-2xl text-primary">{userProfile.stats.zonesCleared}</CardTitle>
                  </CardHeader>
                </Card>
              </div>
            </section>
          </div>
          
          <Separator className="my-6" />

          {/* Recent Activity Section */}
          <section>
            <h3 className="text-xl font-semibold mb-4 text-primary flex items-center">
              <Bell className="mr-2 h-5 w-5" /> Recent Activity
            </h3>
            <ul className="space-y-4">
              {userProfile.recentActivity.map((activity) => (
                <li key={activity.id} className="flex items-start p-3 bg-muted/30 rounded-md hover:bg-muted/50 transition-colors">
                  <div className="bg-primary text-primary-foreground rounded-full h-8 w-8 flex items-center justify-center mr-4 flex-shrink-0">
                    {/* Could use different icons based on activity type */}
                    <Bell size={16} /> 
                  </div>
                  <div>
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </CardContent>

        <CardFooter className="p-6 justify-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Your Awesome App
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ProfilePage; 