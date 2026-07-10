import { SiteHeader } from "@/components/site-header"
import { Hero } from "@/components/hero"
import { ProblemSection } from "@/components/problem-section"
import { SolutionSection } from "@/components/solution-section"
import { FeaturesSection } from "@/components/features-section"
import { HowItWorks } from "@/components/how-it-works"
import { BenefitSection } from "@/components/benefit-section"
import { TestimonialSection } from "@/components/testimonial-section"
import { FaqSection } from "@/components/faq-section"
import { PricingSection } from "@/components/pricing-section"
import { FinalCta } from "@/components/final-cta"
import { SiteFooter } from "@/components/site-footer"

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <Hero />
        <ProblemSection />
        <SolutionSection />
        <FeaturesSection />
        <HowItWorks />
        <BenefitSection />
        <TestimonialSection />
        <FaqSection />
        <PricingSection />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  )
}
