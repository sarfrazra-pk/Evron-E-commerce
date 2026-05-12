import { useState } from "react";
import { useGetEditorConfig } from "@workspace/api-client-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from "lucide-react";

export default function ContactUs() {
  const { data: config, isLoading } = useGetEditorConfig();
  const section = config?.sections.find(s => s.type === "page-contact");
  const d = (section?.data ?? {}) as Record<string, string>;

  const heading  = d.heading  || "Contact Us";
  const subtext  = d.subtext  || "We are here to help. Reach out to us anytime and we will get back to you as soon as possible.";
  const email    = d.email    || "support@evron.pk";
  const phone    = d.phone    || "+92 300 0000000";
  const address  = d.address  || "Karachi, Pakistan";
  const hours    = d.hours    || "Monday – Saturday: 9am – 6pm";
  const extraInfo = d.extraInfo || "For order issues, please include your order number in the message so we can help you faster.";

  const [form, setForm]     = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero */}
      <section className="bg-secondary text-white py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          {isLoading ? (
            <><Skeleton className="h-12 w-64 mx-auto mb-4 bg-white/10" /><Skeleton className="h-6 w-96 mx-auto bg-white/10" /></>
          ) : (
            <>
              <h1 className="text-5xl font-black mb-3">{heading}</h1>
              <p className="text-white/70 text-lg">{subtext}</p>
            </>
          )}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-16 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Contact info cards */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-5">Get in Touch</h2>

            {[
              { icon: Mail,    label: "Email",   value: email,   href: `mailto:${email}` },
              { icon: Phone,   label: "Phone",   value: phone,   href: `tel:${phone}` },
              { icon: MapPin,  label: "Address", value: address, href: undefined },
              { icon: Clock,   label: "Hours",   value: hours,   href: undefined },
            ].map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="bg-white rounded-2xl border border-border p-5 flex items-start gap-4 shadow-sm">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">{label}</p>
                  {href ? (
                    <a href={href} className="font-semibold text-foreground hover:text-primary transition-colors">{value}</a>
                  ) : (
                    <p className="font-semibold text-foreground">{value}</p>
                  )}
                </div>
              </div>
            ))}

            {extraInfo && (
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
                <p className="text-sm text-muted-foreground leading-relaxed">{extraInfo}</p>
              </div>
            )}
          </div>

          {/* Contact form */}
          <div className="bg-white rounded-2xl border border-border p-8 shadow-sm">
            <h2 className="text-xl font-bold mb-6">Send a Message</h2>
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold">Message Sent!</h3>
                <p className="text-muted-foreground">Thank you for reaching out. We will get back to you shortly.</p>
                <button onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }} className="mt-2 text-primary font-semibold hover:underline text-sm">
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Your Name *</label>
                    <input
                      required value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Ali Khan"
                      className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Email *</label>
                    <input
                      required type="email" value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="you@email.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Subject *</label>
                  <input
                    required value={form.subject}
                    onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    placeholder="e.g. Order issue, Product question..."
                    className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Message *</label>
                  <textarea
                    required rows={5} value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Write your message here..."
                    className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>
                <button type="submit" className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" /> Send Message
                </button>
              </form>
            )}
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}
