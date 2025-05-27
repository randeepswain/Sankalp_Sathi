import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Shield, Clock, Users, Accessibility, Phone, Star, CheckCircle } from 'lucide-react';

export default function Landing() {
  const handleLogin = () => {
    window.location.href = '/api/login';
  };

  const features = [
    {
      icon: Users,
      title: 'Verified Companions',
      description: 'All companions undergo background checks and skill verification for your safety and peace of mind.',
    },
    {
      icon: Accessibility,
      title: 'Accessibility First',
      description: 'Built with WCAG 2.1 compliance, voice assistance, and features specifically for users with disabilities.',
    },
    {
      icon: Clock,
      title: 'Real-time Support',
      description: 'Get immediate assistance with live location tracking and instant companion matching.',
    },
    {
      icon: Shield,
      title: 'Emergency Ready',
      description: '24/7 emergency support with instant alert system and emergency contact notification.',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah M.',
      location: 'San Francisco, CA',
      rating: 5,
      text: 'Sankalp Sathi has been a lifesaver. The companions are professional and the voice assistance makes it so easy to use.',
    },
    {
      name: 'Robert K.',
      location: 'Austin, TX',
      rating: 5,
      text: 'As someone with mobility challenges, this app has given me back my independence. Highly recommended!',
    },
    {
      name: 'Maria G.',
      location: 'Miami, FL',
      rating: 5,
      text: 'The emergency features give me and my family peace of mind. Great support from caring companions.',
    },
  ];

  const renderStars = (rating: number) => (
    <div className="flex text-yellow-400">
      {[...Array(rating)].map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-current" />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">Sankalp Sathi</h1>
              <Badge className="ml-3 bg-green-100 text-green-800">Resolution Companion</Badge>
            </div>
            <Button onClick={handleLogin} className="bg-indigo-600 hover:bg-indigo-700">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-8">
              Connecting Hearts,
              <span className="text-indigo-600 block">Empowering Lives</span>
            </h2>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Sankalp Sathi bridges the gap between those who need assistance and those ready to help. 
              Our platform connects users, especially those with disabilities, with verified companions 
              for daily tasks, emergency support, and meaningful companionship.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleLogin}
                size="lg" 
                className="bg-indigo-600 hover:bg-indigo-700 text-lg px-8 py-4"
              >
                Start Your Journey
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="text-lg px-8 py-4"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Banner */}
      <section className="bg-red-600 text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center text-center">
            <Phone className="w-6 h-6 mr-3" />
            <span className="text-lg font-semibold">24/7 Emergency Support Available</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Sankalp Sathi?
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built with accessibility, safety, and dignity at its core
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-6 h-6 text-indigo-600" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h3>
            <p className="text-xl text-gray-600">
              Simple steps to get the help you need
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Create Your Profile',
                description: 'Set up your profile with your needs, preferences, and accessibility requirements.',
              },
              {
                step: '2',
                title: 'Find Companions',
                description: 'Browse verified companions near you or request specific task assistance.',
              },
              {
                step: '3',
                title: 'Get Support',
                description: 'Connect with your companion and receive the assistance you need safely.',
              },
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  {step.step}
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-4">{step.title}</h4>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h3>
            <p className="text-xl text-gray-600">
              Real stories from our community
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {renderStars(testimonial.rating)}
                  </div>
                  <p className="text-gray-600 mb-4 italic">"{testimonial.text}"</p>
                  <div className="border-t pt-4">
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.location}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Accessibility Features */}
      <section className="py-20 bg-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Built for Everyone
            </h3>
            <p className="text-xl text-gray-600">
              Accessibility features designed with care
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              'Voice assistance and read-aloud features',
              'High contrast and large text options',
              'Screen reader compatibility',
              'Simple, intuitive navigation',
              'Emergency one-touch access',
              'Multilingual support',
            ].map((feature, index) => (
              <div key={index} className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-indigo-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl lg:text-4xl font-bold text-white mb-8">
            Ready to Get Started?
          </h3>
          <p className="text-xl text-indigo-100 mb-12">
            Join thousands of users who have found independence and support through Sankalp Sathi.
          </p>
          <Button 
            onClick={handleLogin}
            size="lg" 
            className="bg-white text-indigo-600 hover:bg-gray-100 text-lg px-12 py-4"
          >
            Join Sankalp Sathi Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h4 className="text-2xl font-bold mb-4">Sankalp Sathi</h4>
            <p className="text-gray-400 mb-6">Resolution Companion - Connecting hearts, empowering lives</p>
            <div className="flex justify-center items-center space-x-6 text-sm text-gray-400">
              <span>© 2024 Sankalp Sathi</span>
              <span>•</span>
              <span>Privacy Policy</span>
              <span>•</span>
              <span>Terms of Service</span>
              <span>•</span>
              <span>Accessibility</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
