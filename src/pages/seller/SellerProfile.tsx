import { useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera } from 'lucide-react';

export default function SellerProfile() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | undefined>(user?.avatarUrl);

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarPreview(URL.createObjectURL(file));

            // Upload immediately or wait for save? 
            // Often avatar updates are immediate or part of the form.
            // Let's implement immediate update for avatar for better feedback loop.
            try {
                const fileId = await apiClient.uploadFile(file);
                const fileUrl = apiClient.getFilePreview(fileId);

                // Logic to update user profile with new avatar URL would go here.
                // Since our `updateUser` isn't fully built to take arbitrary data yet in the store/api,
                // we'll just log it for now or assume there's a method. 
                // Need to update `User` document in database.
                // Assuming we'd add `updateProfile` to API.
                console.log("New Avatar URL:", fileUrl);
                // await apiClient.updateUserProfile(user.$id, { avatarUrl: fileUrl });
            } catch (error) {
                console.error("Failed to upload avatar", error);
            }
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold">Profile & Settings</h1>

            <div className="grid gap-8">
                {/* Profile Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Update your personal details.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-col items-center sm:flex-row gap-6">
                            <div className="relative group">
                                <Avatar className="h-24 w-24">
                                    <AvatarImage src={avatarPreview} />
                                    <AvatarFallback className="text-xl bg-slate-200">{user?.name?.[0]}</AvatarFallback>
                                </Avatar>
                                <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-white">
                                    <Camera className="h-6 w-6" />
                                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                                </label>
                            </div>
                            <div className="flex-1 space-y-1 text-center sm:text-left">
                                <h3 className="text-lg font-medium">{user?.name}</h3>
                                <p className="text-sm text-slate-500">{user?.email}</p>
                                <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Full Name</Label>
                                <Input defaultValue={user?.name} />
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input defaultValue={user?.email} disabled />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Phone Number</Label>
                            <Input placeholder="+1 (555) 000-0000" />
                        </div>
                        <Button>Save Changes</Button>
                    </CardContent>
                </Card>

                {/* Password Change */}
                <Card>
                    <CardHeader>
                        <CardTitle>Security</CardTitle>
                        <CardDescription>Change your password.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Current Password</Label>
                            <Input type="password" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>New Password</Label>
                                <Input type="password" />
                            </div>
                            <div className="space-y-2">
                                <Label>Confirm Password</Label>
                                <Input type="password" />
                            </div>
                        </div>
                        <Button variant="outline">Update Password</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
