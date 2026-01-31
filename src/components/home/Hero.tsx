import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function Hero() {
    return (
        <section className="bg-slate-900 text-white min-h-[calc(100vh-4rem)] flex items-center justify-center relative overflow-hidden">
            {/* Background Gradient/Image */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-slate-900 to-black opacity-90" />

            {/* Content Container */}
            <div className="relative z-10 max-w-screen-xl mx-auto px-4 flex flex-col lg:flex-row items-center justify-between gap-12">

                {/* Left: Text Content */}
                <div className="lg:w-1/2 text-center lg:text-left space-y-6">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-purple-500/20 text-purple-200 text-sm font-medium border border-purple-500/30">
                        🚀 The Future of Tech is Here
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-tight">
                        Experience the <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                            Extraordinary ⚡
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto lg:mx-0">
                        Discover the all-new iPhone 17 and premium electronics.
                        Unmatched performance, stunning design, and quality you can trust. 📱✨
                    </p>
                    <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
                        <Link to="/shop">
                            <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 text-lg h-14 px-8 rounded-full">
                                Shop Now 🛍️
                            </Button>
                        </Link>
                        <Link to="/about">
                            <Button variant="outline" size="lg" className="text-white border-white hover:bg-white/10 text-lg h-14 px-8 rounded-full">
                                Learn More ℹ️
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Right: Phone Image */}
                <div className="lg:w-1/2 flex justify-center lg:justify-end relative">
                    {/* Decorative Blobs/Vectors */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] pointer-events-none">
                        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full opacity-30 animate-spin-slow">
                            <path fill="#A855F7" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,79.6,-46.9C87.4,-34.7,90.1,-20.4,85.8,-8.3C81.5,3.8,70.2,13.7,60.6,23.3C51,32.9,43.1,42.2,33.5,49.8C23.9,57.4,12.6,63.4,-0.4,64.1C-13.4,64.8,-25.1,60.2,-35.3,52.8C-45.5,45.4,-54.2,35.2,-61.6,23.5C-69,11.8,-75.1,-1.5,-73.4,-14.2C-71.7,-26.9,-62.2,-39,-51.2,-48.1C-40.2,-57.2,-27.7,-63.3,-14.8,-65.9C-1.9,-68.5,11.4,-67.6,24,-66.7" transform="translate(100 100)" />
                        </svg>
                    </div>

                    <div className="absolute -inset-4 bg-purple-800/30 blur-3xl rounded-full" />

                    {/* Phone Image (Floating Animation) */}
                    <img
                        src="/iPhone17.png"
                        alt="iPhone 17"
                        className="relative w-full max-w-sm lg:max-w-md drop-shadow-2xl animate-float object-contain"
                    />
                </div>
            </div>
        </section>
    );
}
