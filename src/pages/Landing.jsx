import { useCallback, useEffect, useRef } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';
import Lenis from 'lenis';
import LandingNav from '../components/landing/LandingNav';
import Hero from '../components/landing/Hero';
import HowItWorks from '../components/landing/HowItWorks';
import LiveLots from '../components/landing/LiveLots';
import Realtime from '../components/landing/Realtime';
import { Categories, Faq, Footer, Manifesto, Marquee, SellCta, Testimonials } from '../components/landing/Sections';

const Landing = () => {
  const lenisRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });

  // Inertial smooth scrolling on the landing page only (skipped for reduced-motion users)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4) });
    lenisRef.current = lenis;
    let raf;
    const loop = (time) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const navigate = useCallback((target) => {
    const el = typeof target === 'string' ? document.querySelector(target) : null;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(el ?? 0, { offset: el ? -24 : 0, duration: 1.4 });
    } else if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const onMenuToggle = useCallback((open) => {
    if (!lenisRef.current) return;
    if (open) lenisRef.current.stop();
    else lenisRef.current.start();
  }, []);

  useEffect(() => {
    document.title = 'ThriftBid — Every thing has a second story';
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.25 } }} className="bg-paper">
      <motion.div style={{ scaleX: progress }} className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-flare" aria-hidden />
      <LandingNav onNavigate={navigate} onMenuToggle={onMenuToggle} />
      <main>
        <Hero onNavigate={navigate} />
        <Marquee />
        <Manifesto />
        <HowItWorks />
        <LiveLots />
        <Realtime />
        <Categories />
        <Testimonials />
        <SellCta />
        <Faq />
      </main>
      <Footer onNavigate={navigate} />
    </motion.div>
  );
};

export default Landing;
