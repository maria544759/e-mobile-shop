import { Card, CardContent } from "@/components/ui/card";

export default function About() {
    return (
        <div className="max-w-screen-xl mx-auto px-4 py-12 max-w-4xl space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold tracking-tight">About eShop</h1>
                <p className="text-slate-500 max-w-2xl mx-auto">
                    Building the future of e-commerce, one pixel at a time.
                </p>
            </div>

            <Card>
                <CardContent className="p-8 space-y-6">
                    <div>
                        <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
                        <p className="text-slate-700 leading-relaxed">
                            At eShop, we believe in making high-quality electronics accessible to everyone.
                            Our platform connects you with trusted sellers offering the best products in the market.
                            We prioritize user experience, security, and speed to ensure your shopping journey is seamless.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-semibold mb-4">The Project</h2>
                        <p className="text-slate-700 leading-relaxed">
                            This application is a demonstration of a modern, full-stack e-commerce platform
                            built with React, TypeScript, and Appwrite. It showcases features like
                            real-time database interactions, secure authentication, and a responsive UI
                            designed for all devices.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-semibold mb-4">Contact</h2>
                        <ul className="list-disc list-inside text-slate-700 space-y-2">
                            <li>Email: support@eshop-demo.com</li>
                            <li>Phone: +1 (555) 123-4567</li>
                            <li>Address: 123 Tech Avenue, Silicon Valley, CA</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
