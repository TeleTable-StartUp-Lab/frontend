import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone } from 'lucide-react';

const Contact = () => {
    useEffect(() => {
        document.title = 'TeleTable - Contact Us';
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
                    <Mail className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary">Contact Us</span>
                </div>

                <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight">
                    Get in <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                        Touch
                    </span>
                </h1>

                <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                    Have questions or feedback? We'd love to hear from you. Reach out to our team anytime.
                </p>
            </motion.div>

            {/* Contact Information */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6"
            >
                <motion.div variants={itemVariants} className="glass-panel rounded-xl p-6 border border-white/10 text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                        <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Email</h3>
                    <p className="text-gray-400">contact@teletable.com</p>
                </motion.div>

                <motion.div variants={itemVariants} className="glass-panel rounded-xl p-6 border border-white/10 text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                        <Phone className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Phone</h3>
                    <p className="text-gray-400">+1 (555) 123-4567</p>
                </motion.div>

                <motion.div variants={itemVariants} className="glass-panel rounded-xl p-6 border border-white/10 text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Location</h3>
                    <p className="text-gray-400">StartUp Lab, Tech District</p>
                </motion.div>
            </motion.div>

            {/* Additional Info */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="max-w-4xl mx-auto"
            >
                <motion.div variants={itemVariants} className="glass-panel rounded-xl p-8 border border-white/10">
                    <h2 className="text-2xl font-bold text-white mb-4">Office Hours</h2>
                    <div className="space-y-2 text-gray-400">
                        <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                        <p>Saturday: 10:00 AM - 4:00 PM</p>
                        <p>Sunday: Closed</p>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Contact;
