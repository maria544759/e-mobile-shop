import { useState } from 'react';
import { Client, Account, Databases, ID } from 'appwrite';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// Re-using constants (duplicated for simplicity in this script, or better to export from appwrite.ts if I refactored)
const ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT;
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const USERS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID;

const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID);
const account = new Account(client);
const databases = new Databases(client);

const USERS_TO_SEED = [
    { name: 'Maria', email: 'maria@example.com', password: 'maria123', role: 'seller' },
    { name: 'Musab', email: 'musab@example.com', password: 'musab123', role: 'seller' },
    { name: 'Ismail', email: 'ismail@example.com', password: 'ismail123', role: 'customer' },
];

export default function Seeder() {
    const [status, setStatus] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const seed = async () => {
        setLoading(true);
        const logs: string[] = [];

        for (const u of USERS_TO_SEED) {
            logs.push(`Processing ${u.name}...`);
            let userId = '';

            // 1. Create Account
            try {
                await account.create(ID.unique(), u.email, u.password, u.name);
                logs.push(`✅ Created Account for ${u.name}`);

                // LOGIN to create the document as the user (Permissions usually require User or specific role)
                await account.createEmailPasswordSession(u.email, u.password);

                // Get the real ID from the session/account
                const userBox = await account.get();
                userId = userBox.$id;

            } catch (error: any) {
                if (error.code === 409) {
                    logs.push(`⚠️ Account for ${u.name} already exists. Trying to login...`);
                    try {
                        // If exists, try to login to verify/get ID
                        await account.createEmailPasswordSession(u.email, u.password);
                        const userBox = await account.get();
                        userId = userBox.$id;
                    } catch (loginError) {
                        logs.push(`❌ Could not login to existing account ${u.name}`);
                    }
                } else {
                    logs.push(`❌ Failed to create/access account ${u.name}: ${error.message}`);
                }
            }

            // 2. Create/Update User Document
            if (userId) {
                try {
                    await databases.createDocument(
                        DATABASE_ID,
                        USERS_COLLECTION_ID,
                        userId,
                        {
                            name: u.name,
                            email: u.email,
                            role: u.role,
                            passwordHash: 'managed_by_appwrite_auth', // Placeholder to satisfy schema
                            isActive: true
                        }
                    );
                    logs.push(`✅ Created User Document for ${u.name}`);
                } catch (error: any) {
                    // 409 means document already exists
                    if (error.code === 409) {
                        logs.push(`⚠️ User Doc for ${u.name} already exists.`);
                    } else {
                        logs.push(`❌ Failed to create User Doc ${u.name}: ${error.message}`);
                    }
                }

                // LOGOUT to prepare for next iteration
                try {
                    await account.deleteSession('current');
                } catch (e) { }
            }
        }

        setStatus(logs);
        setLoading(false);
    };

    return (
        <div className="max-w-screen-xl mx-auto py-10 flex justify-center">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle>Database Seeder</CardTitle>
                    <CardDescription>Inject initial users into Appwrite</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button onClick={seed} disabled={loading} className="w-full">
                        {loading ? 'Seeding...' : 'Inject Users'}
                    </Button>
                    <div className="bg-slate-100 p-4 rounded-md h-64 overflow-y-auto text-xs font-mono">
                        {status.length === 0 ? 'Ready to seed.' : status.map((log, i) => <div key={i}>{log}</div>)}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
