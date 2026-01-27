import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';

const Terms = () => {
    useEffect(() => {
        document.title = 'TeleTable - Terms of Service';
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5
            }
        }
    };

    return (
        <div className="space-y-16 pb-20">
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center space-y-6"
            >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary">Terms of Service</span>
                </div>

                <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight">
                    Terms of <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                        Service
                    </span>
                </h1>

                <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                    Please read these terms carefully before using our services.
                </p>
            </motion.div>

            {/* Terms Content */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="max-w-4xl mx-auto space-y-8"
            >
                <motion.div variants={itemVariants} className="glass-panel rounded-xl p-8 border border-white/10">
                    <h2 className="text-2xl font-bold text-white mb-4">Acceptance of Terms</h2>
                    <p className="text-gray-400 leading-relaxed mb-4">
                        By accessing and using TeleTable's services, you accept and agree to be bound by the terms and
                        provisions of this agreement. If you do not agree to these terms, please do not use our services.
                    </p>
                </motion.div>

                <motion.div variants={itemVariants} className="glass-panel rounded-xl p-8 border border-white/10">
                    <h2 className="text-2xl font-bold text-white mb-4">Use of Service</h2>
                    <p className="text-gray-400 leading-relaxed mb-4">
                        You agree to use our services only for lawful purposes and in accordance with these Terms.
                        You must not use our services in any way that could damage, disable, or impair the service.
                    </p>
                </motion.div>

                <motion.div variants={itemVariants} className="glass-panel rounded-xl p-8 border border-white/10">
                    <h2 className="text-2xl font-bold text-white mb-4">User Accounts</h2>
                    <p className="text-gray-400 leading-relaxed mb-4">
                        You are responsible for maintaining the confidentiality of your account credentials and for all
                        activities that occur under your account. You agree to notify us immediately of any unauthorized use.
                    </p>
                </motion.div>

                <motion.div variants={itemVariants} className="glass-panel rounded-xl p-8 border border-white/10">
                    <h2 className="text-2xl font-bold text-white mb-4">Intellectual Property</h2>
                    <p className="text-gray-400 leading-relaxed mb-4">
                        The service and its original content, features, and functionality are owned by TeleTable and are
                        protected by international copyright, trademark, and other intellectual property laws.
                    </p>
                </motion.div>

                <motion.div variants={itemVariants} className="glass-panel rounded-xl p-8 border border-white/10">
                    <h2 className="text-2xl font-bold text-white mb-4">Limitation of Liability</h2>
                    <p className="text-gray-400 leading-relaxed mb-4">
                        In no event shall TeleTable be liable for any indirect, incidental, special, consequential, or
                        punitive damages resulting from your use of or inability to use the service.
                    </p>
                </motion.div>

                <motion.div variants={itemVariants} className="glass-panel rounded-xl p-8 border border-white/10">
                    <h2 className="text-2xl font-bold text-white mb-4">Changes to Terms</h2>
                    <p className="text-gray-400 leading-relaxed">
                        We reserve the right to modify these terms at any time. We will notify users of any material
                        changes. Your continued use of the service after such modifications constitutes acceptance of the new terms.
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Terms;
