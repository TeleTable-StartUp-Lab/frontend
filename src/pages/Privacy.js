import React, { useEffect } from 'react';
import { Shield } from 'lucide-react';

const Privacy = () => {
    useEffect(() => {
        document.title = 'TeleTable - Privacy Policy';
    }, []);

    return (
        <div className="space-y-16 pb-20">
            {/* Hero Section */}
            <div className="text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                    <Shield className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary">Privacy Policy</span>
                </div>

                <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight">
                    Your Privacy <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                        Matters to Us
                    </span>
                </h1>

                <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                    We are committed to protecting your privacy and ensuring the security of your personal information.
                </p>
            </div>

            {/* Privacy Content */}
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="glass-panel rounded-xl p-8 border border-white/10">
                    <h2 className="text-2xl font-bold text-white mb-4">Information We Collect</h2>
                    <p className="text-gray-400 leading-relaxed mb-4">
                        We collect information that you provide directly to us, including when you create an account,
                        use our services, or communicate with us. This may include your name, email address, and usage data.
                    </p>
                </div>

                <div className="glass-panel rounded-xl p-8 border border-white/10">
                    <h2 className="text-2xl font-bold text-white mb-4">How We Use Your Information</h2>
                    <p className="text-gray-400 leading-relaxed mb-4">
                        We use the information we collect to provide, maintain, and improve our services, to communicate with you,
                        and to ensure the security and integrity of our platform.
                    </p>
                </div>

                <div className="glass-panel rounded-xl p-8 border border-white/10">
                    <h2 className="text-2xl font-bold text-white mb-4">Data Security</h2>
                    <p className="text-gray-400 leading-relaxed mb-4">
                        We implement appropriate technical and organizational measures to protect your personal information
                        against unauthorized access, alteration, disclosure, or destruction.
                    </p>
                </div>

                <div className="glass-panel rounded-xl p-8 border border-white/10">
                    <h2 className="text-2xl font-bold text-white mb-4">Your Rights</h2>
                    <p className="text-gray-400 leading-relaxed mb-4">
                        You have the right to access, correct, or delete your personal information. You may also object to
                        or restrict certain types of data processing. Contact us if you wish to exercise these rights.
                    </p>
                </div>

                <div className="glass-panel rounded-xl p-8 border border-white/10">
                    <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
                    <p className="text-gray-400 leading-relaxed">
                        If you have any questions about this Privacy Policy, please contact us at privacy@teletable.com
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Privacy;
