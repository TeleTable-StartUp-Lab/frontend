import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Battery, Wifi } from 'lucide-react';

const Landing = () => {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-8 py-12">
        <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
          <span className="block">Der Fahrende Tisch</span>
          <span className="block text-primary">TeleTable</span>
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Ein autonomes Transportsystem für den modernen Arbeitsplatz. 
          Effizient, smart und immer zur Stelle, wenn man ihn braucht.
        </p>
        <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
          <div className="rounded-md shadow">
            <Link
              to="/login"
              className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-gray-800 bg-primary hover:bg-opacity-90 md:py-4 md:text-lg md:px-10"
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white rounded-xl shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Smarte Technologie
            </p>
          </div>

          <div className="mt-10">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                    <Truck className="h-6 w-6 text-gray-800" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Autonome Navigation</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Der Tisch findet selbstständig seinen Weg durch das Büro, weicht Hindernissen aus und erreicht sein Ziel sicher.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                    <Wifi className="h-6 w-6 text-gray-800" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Echtzeit Telemetrie</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Überwachen Sie Status, Position und Aufträge in Echtzeit über unser Web-Dashboard.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                    <Battery className="h-6 w-6 text-gray-800" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Intelligentes Energiemanagement</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Automatische Rückkehr zur Ladestation bei niedrigem Akkustand für maximale Verfügbarkeit.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-10">
            <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Das Team</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Wer wir sind
            </p>
          </div>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-8">
            {[1, 2, 3].map((member) => (
              <div key={member} className="space-y-4">
                <div className="aspect-w-3 aspect-h-2">
                  <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                    <span className="text-lg">Team Member {member}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-lg leading-6 font-medium space-y-1">
                    <h3>Max Mustermann</h3>
                    <p className="text-primary">Developer</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;