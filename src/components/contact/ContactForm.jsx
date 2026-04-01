
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { addDocument } from '@/lib/firestoreService';
import { 
  validateEmail, 
  validatePhone, 
  sanitizeInput, 
  checkSubmissionDelay,
  generateMathChallenge,
  validateMathAnswer
} from '@/lib/contactValidation';
import { Loader2, CheckCircle2 } from 'lucide-react';

const ContactForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    honeypot: '', // hidden field
    mathAnswer: ''
  });
  const [challenge, setChallenge] = useState({ question: '', answer: 0 });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [lastSubmitTime, setLastSubmitTime] = useState(0);

  useEffect(() => {
    setChallenge(generateMathChallenge());
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    
    if (!formData.mathAnswer.trim()) {
      newErrors.mathAnswer = 'Please solve the math problem';
    } else if (!validateMathAnswer(formData.mathAnswer, challenge.answer)) {
      newErrors.mathAnswer = 'Incorrect answer. Please try again.';
      setChallenge(generateMathChallenge()); // Reset challenge on failure
      setFormData(prev => ({ ...prev, mathAnswer: '' }));
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Spam protection: Honeypot
    if (formData.honeypot) {
      console.warn("Bot detected via honeypot.");
      return; // Silently reject
    }

    // Spam protection: Minimum delay
    if (!checkSubmissionDelay(lastSubmitTime, 1000)) {
      toast({ variant: "destructive", title: "Please wait before submitting again." });
      return;
    }

    if (!validateForm()) return;

    setLoading(true);

    try {
      const sanitizedData = {
        fullName: sanitizeInput(formData.fullName),
        email: sanitizeInput(formData.email),
        phone: sanitizeInput(formData.phone),
        subject: sanitizeInput(formData.subject),
        message: sanitizeInput(formData.message),
        verificationPassed: true,
        createdAt: new Date().toISOString(),
        status: 'new',
        isRead: false,
        sourcePage: 'contact',
        notes: ''
      };

      await addDocument('contactSubmissions', sanitizedData);
      
      setLastSubmitTime(Date.now());
      setSuccess(true);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        honeypot: '',
        mathAnswer: ''
      });
      setChallenge(generateMathChallenge());
      
      toast({
        title: "Success",
        description: "Your message has been sent successfully. Our team will contact you soon."
      });

      // Reset success message after a few seconds
      setTimeout(() => setSuccess(false), 5000);
      
    } catch (error) {
      console.error("Error submitting contact form:", error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "There was an error sending your message. Please try again later."
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-card rounded-2xl border border-border">
        <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
        <p className="text-muted-foreground mb-6">Thank you for reaching out. We will get back to you as soon as possible.</p>
        <Button onClick={() => setSuccess(false)} variant="outline">Send Another Message</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm contact-form-container">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-foreground">Full Name <span className="text-destructive">*</span></Label>
          <Input 
            id="fullName" 
            name="fullName" 
            value={formData.fullName} 
            onChange={handleChange} 
            className={`bg-background ${errors.fullName ? 'border-destructive focus-visible:ring-destructive' : ''}`}
            placeholder="John Doe"
            disabled={loading}
          />
          {errors.fullName && <p className="text-xs text-destructive mt-1">{errors.fullName}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground">Email Address <span className="text-destructive">*</span></Label>
          <Input 
            id="email" 
            name="email" 
            type="email" 
            value={formData.email} 
            onChange={handleChange} 
            className={`bg-background ${errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
            placeholder="john@example.com"
            disabled={loading}
          />
          {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-foreground">Phone Number</Label>
          <Input 
            id="phone" 
            name="phone" 
            type="tel" 
            value={formData.phone} 
            onChange={handleChange} 
            className={`bg-background ${errors.phone ? 'border-destructive focus-visible:ring-destructive' : ''}`}
            placeholder="+1 (555) 000-0000"
            disabled={loading}
          />
          {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="subject" className="text-foreground">Subject <span className="text-destructive">*</span></Label>
          <Input 
            id="subject" 
            name="subject" 
            value={formData.subject} 
            onChange={handleChange} 
            className={`bg-background ${errors.subject ? 'border-destructive focus-visible:ring-destructive' : ''}`}
            placeholder="How can we help?"
            disabled={loading}
          />
          {errors.subject && <p className="text-xs text-destructive mt-1">{errors.subject}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message" className="text-foreground">Message <span className="text-destructive">*</span></Label>
        <Textarea 
          id="message" 
          name="message" 
          value={formData.message} 
          onChange={handleChange} 
          className={`min-h-[150px] bg-background resize-y ${errors.message ? 'border-destructive focus-visible:ring-destructive' : ''}`}
          placeholder="Tell us more about your inquiry..."
          disabled={loading}
        />
        {errors.message && <p className="text-xs text-destructive mt-1">{errors.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
        <div className="space-y-2">
          <Label htmlFor="mathAnswer" className="text-foreground">Spam Check: {challenge.question} <span className="text-destructive">*</span></Label>
          <Input 
            id="mathAnswer" 
            name="mathAnswer" 
            type="number" 
            value={formData.mathAnswer} 
            onChange={handleChange} 
            className={`bg-background ${errors.mathAnswer ? 'border-destructive focus-visible:ring-destructive' : ''}`}
            placeholder="Enter the result"
            disabled={loading}
          />
          {errors.mathAnswer && <p className="text-xs text-destructive mt-1">{errors.mathAnswer}</p>}
        </div>
        
        {/* Honeypot field - hidden from real users */}
        <div className="hidden" aria-hidden="true">
          <Label htmlFor="honeypot">Leave this field empty</Label>
          <Input id="honeypot" name="honeypot" value={formData.honeypot} onChange={handleChange} tabIndex="-1" autoComplete="off" />
        </div>

        <Button type="submit" className="w-full sm:w-auto mt-4 sm:mt-0" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            'Send Message'
          )}
        </Button>
      </div>
    </form>
  );
};

export default ContactForm;
