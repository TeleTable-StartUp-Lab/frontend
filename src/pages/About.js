import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';

const About = () => {
    useEffect(() => {
        document.title = 'TeleTable - About';
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

    const teamMembers = [
        {
            name: 'Lukas Weger',
            role: 'Backend & Infrastructure',
            description: 'I handle the project\'s infrastructure and backend, building the entire Rust-based system from scratch with Axum, Tokio, Postgres, Docker, and Redis. I work fast and independently, leaning on strong technical depth to move features from idea to implementation in one focused push. As a full-stack engineer, I\'m the person the team comes to for tough questions, even if I naturally prefer working on my own and keeping momentum high.',
        },
        {
            name: 'Theo Jona Stolzlechner',
            role: 'Embedded Systems Developer',
            description: 'I am responsible for all embedded systems development in our project, focusing on programming the ESP32 in C. I design and implement the core logic that enables our autonomous table to drive, navigate, and interact safely with its environment. I enjoy solving complex technical problems, writing clean and efficient code, and making sure hardware and software work seamlessly together. I\'m someone who learns quickly, stays calm under pressure, and collaborates well with the team to turn ideas into real, working systems.',
        },
        {
            name: 'Lukas Fauster',
            role: 'Project Lead & 3D Development',
            description: 'I\'m responsible for leading and coordinating the project, making sure everyone stays aligned, organized, and moving in the same direction. I also contribute to our 3D development and technical drawings, working together with the others to turn ideas into clear, structured models. And whenever someone on the team needs help or runs into a hurdle, I\'m always ready to support them — whether it\'s solving a problem, giving feedback, or just keeping things on track. With a mix of coordination, technical contribution, and team support, I help ensure the project runs smoothly and keeps its momentum.',
        },
        {
            name: 'Gabriel Mirandola',
            role: '3D-Designer',
            description: 'I’m responsible for the full 3D development of the table, covering mechanical design, hardware integration, and all structural details. I translate requirements into precise models, ensuring every part fits together both functionally and manufacturably. Beyond the physical design, I support the team on the electronics side — selecting components, planning integration points, and making sure the hardware layout aligns with the overall system. I also assist with embedded work when needed, helping bridge the gap between mechanical, electrical, and firmware development so the whole system operates as intended.',
        },
        {
            name: 'Team Member 5',
            role: 'Software Engineer',
            description: 'Develops core features and optimizes performance. Always looking for elegant solutions to complex problems.',
        },
        {
            name: 'Team Member 6',
            role: 'Product Designer',
            description: 'Designs user experiences and interfaces. Focuses on making technology accessible to everyone.',
        },
    ];

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
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary">Our Team</span>
                </div>

                <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight">
                    Meet the <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                        TeleTable Team
                    </span>
                </h1>

                <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                    A passionate group of engineers and designers working together to revolutionize
                    office logistics through innovative automation technology.
                </p>
            </motion.div>

            {/* Team Section */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                {teamMembers.map((member, idx) => (
                    <motion.div
                        key={idx}
                        variants={itemVariants}
                        className="glass-panel rounded-xl p-6 border border-white/10 hover:border-primary/20 transition-all group"
                    >
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-3xl font-bold text-dark-900 group-hover:scale-110 transition-transform">
                                {member.name.charAt(member.name.length - 1)}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
                                <p className="text-sm text-primary mb-3">{member.role}</p>
                                <p className="text-sm text-gray-400 leading-relaxed">{member.description}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};

export default About;
