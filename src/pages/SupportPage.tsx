import { useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, FileText, HelpCircle, Phone } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";

const SupportPage = () => {
  const [showContactForm, setShowContactForm] = useState(false);

  const supportOptions = [
    {
      title: "Submit a Ticket",
      description: "Create a new support ticket for technical issues or maintenance requests",
      icon: MessageCircle,
      link: "/tickets"
    },
    {
      title: "Knowledge Base",
      description: "Browse through our documentation and frequently asked questions",
      icon: FileText,
      link: "/support/knowledge-base"
    },
    {
      title: "FAQ",
      description: "Find quick answers to common questions",
      icon: HelpCircle,
      link: "/support/faq"
    },
    {
      title: "Contact Support",
      description: "Get in touch with our support team directly",
      icon: Phone,
      action: () => setShowContactForm(true)
    }
  ];

  return (
    <div className="container mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2">Support Center</h1>
        <p className="text-gray-600 mb-8">
          Welcome to our support center. How can we help you today?
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {supportOptions.map((option, index) => (
            <Card
              key={index}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => option.action ? option.action() : window.location.href = option.link}
            >
              <CardHeader>
                <option.icon className="w-8 h-8 mb-2 text-primary" />
                <CardTitle>{option.title}</CardTitle>
                <CardDescription>{option.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {showContactForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8"
          >
            <Card>
              <CardHeader>
                <CardTitle>Contact Support</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div>
                    <Input placeholder="Your Name" />
                  </div>
                  <div>
                    <Input type="email" placeholder="Email Address" />
                  </div>
                  <div>
                    <Input placeholder="Subject" />
                  </div>
                  <div>
                    <Textarea placeholder="Describe your issue or question" rows={4} />
                  </div>
                  <div className="flex gap-4">
                    <Button type="submit">Send Message</Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowContactForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default SupportPage;
