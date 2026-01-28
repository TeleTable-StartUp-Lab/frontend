import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Shield, Mail } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Legal = () => {
    const location = useLocation();

    useEffect(() => {
        document.title = 'TeleTable - Privacy, Terms & Contact';
    }, []);

    useEffect(() => {
        if (location.hash) {
            const id = location.hash.replace('#', '');
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }, [location.hash]);

    const sectionVariants = {
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <div className="space-y-10 pb-20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center space-y-4"
            >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                    <Shield className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary">Privacy, Terms & Contact</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
                    Privacy Policy, Terms of Use & Contact
                </h1>
                <p className="text-gray-400 max-w-3xl mx-auto">
                    This page explains how TeleTable handles data, the rules for using the service,
                    and how to get in touch.
                </p>
                <p className="text-sm text-gray-500">Effective date: January 27, 2026</p>
            </motion.div>

            <motion.section
                id="privacy"
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="glass-panel rounded-2xl p-6 md:p-8 border border-white/10 space-y-6"
            >
                <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <h2 className="text-2xl font-semibold">Privacy Policy</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-300">
                    <div className="space-y-3">
                        <h3 className="text-white font-semibold">What we collect</h3>
                        <ul className="space-y-2 list-disc list-inside text-gray-400">
                            <li>Name</li>
                            <li>Email address</li>
                            <li>Password (stored in a hashed form)</li>
                        </ul>
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-white font-semibold">How we use data</h3>
                        <ul className="space-y-2 list-disc list-inside text-gray-400">
                            <li>Create and manage user accounts</li>
                            <li>Authenticate users and control access</li>
                            <li>Enable diary entries and table control for approved users</li>
                            <li>Provide support and respond to requests</li>
                        </ul>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-300">
                    <div className="space-y-3">
                        <h3 className="text-white font-semibold">Sharing & third parties</h3>
                        <p className="text-gray-400">
                            We do not use analytics, advertising, or third-party tracking tools.
                            We do not sell or share your personal data with third parties.
                        </p>
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-white font-semibold">Data retention</h3>
                        <p className="text-gray-400">
                            Account data is stored while the account exists. At this time, account
                            deletion and data export are not available.
                        </p>
                    </div>
                </div>

                <div className="space-y-3 text-sm text-gray-300">
                    <h3 className="text-white font-semibold">Security</h3>
                    <p className="text-gray-400">
                        We apply standard security measures and store passwords in a hashed form.
                        No method of transmission or storage is 100% secure.
                    </p>
                </div>
            </motion.section>

            <motion.section
                id="terms"
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="glass-panel rounded-2xl p-6 md:p-8 border border-white/10 space-y-6"
            >
                <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-primary" />
                    <h2 className="text-2xl font-semibold">Terms of Use</h2>
                </div>

                <div className="space-y-4 text-sm text-gray-400">
                    <p>
                        By using TeleTable, you agree to these terms. TeleTable is a demo/education
                        project without a formal legal entity.
                    </p>

                    <div className="space-y-2">
                        <h3 className="text-white font-semibold">Accounts and access</h3>
                        <ul className="space-y-2 list-disc list-inside">
                            <li>Accounts require a name, email, and password.</li>
                            <li>Normal users have no special rights.</li>
                            <li>Only approved (“known”) users can create diary entries and control the table.</li>
                        </ul>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-white font-semibold">Acceptable use</h3>
                        <ul className="space-y-2 list-disc list-inside">
                            <li>Do not misuse the service or attempt unauthorized access.</li>
                            <li>Do not interfere with device operation or security.</li>
                            <li>We may suspend or terminate access at any time.</li>
                        </ul>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-white font-semibold">No payments</h3>
                        <p>This service does not process payments.</p>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-white font-semibold">Disclaimer & liability</h3>
                        <p>
                            The service is provided “as is” without warranties. To the extent allowed
                            by law, TeleTable is not liable for indirect or consequential damages.
                        </p>
                    </div>
                </div>
            </motion.section>

            <motion.section
                id="contact"
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="glass-panel rounded-2xl p-6 md:p-8 border border-white/10 space-y-6"
            >
                <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-primary" />
                    <h2 className="text-2xl font-semibold">Contact</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-400">
                    <div className="space-y-2">
                        <p className="text-white font-semibold">Contact person</p>
                        <p>Lukas Fauster</p>
                        <p>Email: <a className="text-primary hover:underline" href="mailto:stfauluk@bx.fallmerayer.it">stfauluk@bx.fallmerayer.it</a></p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-white font-semibold">Address</p>
                        <p>Dantestraße, 39E</p>
                        <p>39042 Brixen</p>
                        <p>Autonome Provinz Bozen - Südtirol</p>
                    </div>
                </div>
            </motion.section>
        </div>
    );
};

export default Legal;
