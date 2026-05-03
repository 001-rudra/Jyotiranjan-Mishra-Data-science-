import { motion, useScroll, useSpring, useMotionValue, AnimatePresence, useTransform, animate } from 'motion/react';
import { Canvas, extend, useFrame } from '@react-three/fiber';
import { useGLTF, useTexture, Environment, Lightformer } from '@react-three/drei';
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import * as THREE from 'three';
import './Lanyard.css';

extend({ MeshLineGeometry, MeshLineMaterial });
import { 
  Github, 
  Linkedin, 
  Instagram,
  Mail, 
  ExternalLink, 
  Code2, 
  Cpu, 
  Brain, 
  GraduationCap, 
  Briefcase, 
  ChevronRight,
  ArrowUpRight,
  Sparkles,
  Trophy,
  Rocket,
  Sun,
  Moon,
  MapPin,
  User,
  QrCode,
  Award,
  BookOpen
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import React, { useState, useEffect, useRef, Suspense } from 'react';
import TrueFocus from './TrueFocus';
import RotatingText from './RotatingText';
import DecayCard from './DecayCard';
import DotGrid from './DotGrid';
import CircularGallery from './CircularGallery';
import ScrollStack, { ScrollStackItem } from './ScrollStack';
import TextType from './TextType';
import HoverSplitText from './HoverSplitText';
import Tilt from 'react-parallax-tilt';
import Shuffle from './Shuffle';
import BorderGlow from './BorderGlow';
import PixelCard from './PixelCard';

const CustomCursor = () => {
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  
  // Use direct motion values for position to eliminate any perceived lag
  
  const [cursorType, setCursorType] = useState<'default' | 'hover' | 'text'>('default');
  const [cursorHeight, setCursorHeight] = useState(24);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      const target = e.target as HTMLElement;
      const isClickable = target.closest('a, button, [role="button"]');
      const isName = target.closest('.font-name');
      const isText = !isName && (target.tagName === 'P' || target.tagName === 'H1' || target.tagName === 'H2' || target.tagName === 'H3' || target.tagName === 'SPAN' || target.tagName === 'LI');

      if (isClickable) {
        setCursorType('hover');
      } else if (isText) {
        setCursorType('text');
        const style = window.getComputedStyle(target);
        const fontSize = parseFloat(style.fontSize);
        setCursorHeight(fontSize * 1.2);
      } else {
        setCursorType('default');
      }
    };

    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, [mouseX, mouseY]);

  const offset = cursorType === 'hover' ? -12.5 : -4;

  return (
    <motion.div
      className={cn(
        "custom-cursor hidden md:block",
        cursorType === 'hover' && "cursor-hover",
        cursorType === 'text' && "cursor-text"
      )}
      animate={{
        translateX: offset,
        translateY: offset,
        scale: cursorType === 'hover' ? 1.1 : 1,
      }}
      transition={{ type: "spring", stiffness: 800, damping: 40, mass: 0.1 }}
      style={{
        x: mouseX,
        y: mouseY,
        // @ts-ignore
        '--cursor-height': `${cursorHeight}px`
      }}
    />
  );
};

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
}

const TiltCard: React.FC<TiltCardProps> = ({ children, className }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        zIndex: isHovered ? 50 : 1,
      }}
      animate={{
        scale: isHovered ? 1.05 : 1,
        boxShadow: isHovered 
          ? "0 0 30px rgba(249, 115, 22, 0.12), 0 0 10px rgba(249, 115, 22, 0.05)" 
          : "0 0 0px rgba(249, 115, 22, 0)",
      }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn("relative transition-all duration-500", className)}
    >
      <div style={{ transform: "translateZ(50px)", transformStyle: "preserve-3d" }} className="h-full w-full">
        {children}
      </div>
    </motion.div>
  );
};

const HangingIDCard = () => {
  return (
    <div className="w-[620px] h-[900px] relative">
      <Lanyard />
    </div>
  );
};

function Lanyard({ position = [0, 0, 20] as [number, number, number], gravity = [0, -40, 0] as [number, number, number], fov = 25, transparent = true }) {
  return (
    <div className="lanyard-wrapper">
      <Canvas
        style={{ marginTop: '-100px' }}
        camera={{ position: position, fov: fov }}
        dpr={[1, 2]}
        gl={{ alpha: transparent }}
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)}
      >
        <ambientLight intensity={Math.PI} />
        <Physics gravity={gravity}>
          <Suspense fallback={null}>
            <Band />
          </Suspense>
        </Physics>
        <Environment blur={0.75}>
          <Lightformer intensity={2} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3} color="white" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3} color="white" position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={10} color="white" position={[-10, 0, 14]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
        </Environment>
      </Canvas>
    </div>
  );
}

function Band({ maxSpeed = 50, minSpeed = 0 }) {
  const band = useRef<any>(null),
    fixed = useRef<any>(null),
    j1 = useRef<any>(null),
    j2 = useRef<any>(null),
    j3 = useRef<any>(null),
    card = useRef<any>(null);
  const vec = new THREE.Vector3(),
    ang = new THREE.Vector3(),
    rot = new THREE.Vector3(),
    dir = new THREE.Vector3();
  const segmentProps = { type: 'dynamic' as const, canSleep: true, colliders: false as const, angularDamping: 4, linearDamping: 4 };
  
  // Procedural texture for lanyard
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const cardTexture = useTexture('/id-card.jpg');
  
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0A2472'; // Dark blue background
      ctx.fillRect(0, 0, 2048, 64);
      ctx.fillStyle = '#ffffff'; // White text
      ctx.font = 'normal 32px Arial'; // Normal weight for less thickness
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // Stretch text horizontally
      ctx.save();
      ctx.scale(1.4, 1);
      // Text appearing 2 times with equal gap (adjust x-coordinates for scale)
      ctx.fillText("SIKSHA 'O' ANUSANDHAN", 512 / 1.4, 32);
      ctx.fillText("SIKSHA 'O' ANUSANDHAN", 1536 / 1.4, 32);
      ctx.restore();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    setTexture(tex);
  }, []);

  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()])
  );
  const [dragged, drag] = useState<THREE.Vector3 | false>(false);
  const [hovered, hover] = useState(false);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, 2.03, 0]
  ]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';
      return () => void (document.body.style.cursor = 'auto');
    }
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach(ref => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({ x: vec.x - dragged.x, y: vec.y - dragged.y, z: vec.z - dragged.z });
    }
    if (fixed.current) {
      [j1, j2].forEach(ref => {
        if (!ref.current.lerped) ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
        const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())));
        ref.current.lerped.lerp(
          ref.current.translation(),
          delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed))
        );
      });
      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2.current.lerped);
      curve.points[2].copy(j1.current.lerped);
      curve.points[3].copy(fixed.current.translation());
      band.current.geometry.setPoints(curve.getPoints(32));
      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
    }
  });

  curve.curveType = 'chordal';

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[2, 0, 0]} ref={card} {...segmentProps} type={dragged ? 'kinematicPosition' : 'dynamic'}>
          <CuboidCollider args={[1.4, 1.96, 0.02]} />
          <group
            scale={3.5}
            position={[0, 0, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={e => ((e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId), drag(false))}
            onPointerDown={e => (
              (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId),
              drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())))
            )}
          >
            {/* Procedural Card Mesh */}
            <mesh>
              <boxGeometry args={[0.8, 1.125, 0.02]} />
              <meshPhysicalMaterial
                color="#080808"
                clearcoat={1}
                clearcoatRoughness={0.15}
                roughness={0.5}
                metalness={0.5}
              />
            </mesh>
            {/* Front Image */}
            <mesh position={[0, 0, 0.011]}>
              <planeGeometry args={[0.75, 1.075]} />
              <meshBasicMaterial map={cardTexture} />
            </mesh>
            {/* Metal Clip */}
            <mesh position={[0, 0.58, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.1]} />
              <meshStandardMaterial color="#333" metalness={1} roughness={0.2} />
            </mesh>
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        {/* @ts-ignore */}
        <meshLineGeometry />
        {/* @ts-ignore */}
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={[1000, 1000]}
          useMap
          map={texture}
          repeat={[-1, 1]}
          lineWidth={1}
        />
      </mesh>
    </>
  );
}

const CardDeck = () => {
  const [cards, setCards] = useState([
    { id: 1, title: 'Data Science', color: 'bg-blue-500', img: 'https://picsum.photos/seed/datascience/400/600' },
    { id: 2, title: 'Web Development', color: 'bg-indigo-500', img: 'https://picsum.photos/seed/webdev/400/600' },
    { id: 3, title: 'App Development', color: 'bg-purple-500', img: 'https://picsum.photos/seed/appdev/400/600' },
    { id: 4, title: 'ML Research', color: 'bg-pink-500', img: 'https://picsum.photos/seed/mlresearch/400/600' },
    { id: 5, title: 'System Design', color: 'bg-rose-500', img: 'https://picsum.photos/seed/systemdesign/400/600' },
    { id: 6, title: 'Full Stack', color: 'bg-orange-500', img: 'https://picsum.photos/seed/fullstack/400/600' },
  ]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const rotateX = useTransform(mouseY, [-200, 200], [15, -15]);
  const rotateY = useTransform(mouseX, [-200, 200], [-15, 15]);
  const springRotateX = useSpring(rotateX, { stiffness: 100, damping: 30 });
  const springRotateY = useSpring(rotateY, { stiffness: 100, damping: 30 });

  const moveToFront = () => {
    setCards(prev => {
      const newCards = [...prev];
      const lastCard = newCards.pop()!;
      return [lastCard, ...newCards];
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      moveToFront();
    }, 4000); // Slightly slower for smoothness
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="relative w-64 h-96 md:w-80 md:h-[480px] mx-auto mt-12 mb-24 perspective-1000"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <AnimatePresence mode="popLayout">
        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            layout
            style={{
              zIndex: cards.length - index,
              cursor: 'pointer',
              rotateX: springRotateX,
              rotateY: springRotateY,
            }}
            initial={index === 0 ? { x: 300, opacity: 0, scale: 0.8 } : false}
            animate={{
              scale: 1 - index * 0.05,
              y: index * -20,
              x: index * 15,
              rotateZ: index === 0 ? 0 : (index % 2 === 0 ? 25 : -25),
              opacity: 1 - index * 0.2,
            }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 25,
              mass: 1
            }}
            whileHover={index === 0 ? { scale: 1.1, transition: { duration: 0.3 } } : {}}
            onClick={moveToFront}
            className={cn(
              "absolute inset-0 rounded-3xl shadow-2xl overflow-hidden border-4 border-white/10",
              card.color
            )}
          >
            <img 
              src={card.img} 
              alt={card.title} 
              className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity duration-500"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-white font-bold text-lg">{card.title}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'About', href: '#about' },
    { name: 'Projects', href: '#projects' },
    { name: 'Education', href: '#education' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <nav className={cn(
      "fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-500 w-[95%] max-w-5xl",
      isScrolled ? "top-4" : "top-6"
    )}>
      <div className="liquid-glass-nav flex items-center justify-between px-6 py-3 rounded-full">
        <a href="#" className="text-2xl font-display font-bold tracking-tighter hover:opacity-80 transition-opacity">
          JM<span className="text-primary">.</span>
        </a>
        <div className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href} 
              onClick={() => setActiveSection(link.name)}
              className={cn(
                "relative px-4 py-2 text-sm font-medium transition-colors rounded-full",
                activeSection === link.name ? "text-foreground" : "text-secondary hover:text-foreground"
              )}
            >
              {activeSection === link.name && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 liquid-glass-btn rounded-full -z-10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10">{link.name}</span>
            </a>
          ))}
          <div className="w-px h-6 bg-white/10 mx-2" />
          <a 
            href="#" 
            className="liquid-glass-btn px-5 py-2 text-sm font-bold rounded-full transition-all ml-2"
          >
            Resume
          </a>
        </div>
      </div>
    </nav>
  );
};

const SectionHeading = ({ children, subtitle }: { children: React.ReactNode, subtitle?: string }) => (
  <div className="mb-12">
    <Shuffle
      text={children as string}
      tag="h2"
      className="font-harmond text-5xl md:text-6xl lg:text-7xl font-bold mb-4 tracking-tight text-white capitalize"
      shuffleDirection="right"
      duration={0.35}
      animationMode="evenodd"
      shuffleTimes={1}
      ease="power3.out"
      stagger={0.03}
      threshold={0.1}
      triggerOnce={true}
      triggerOnHover={true}
      respectReducedMotion={true}
      loop={false}
      loopDelay={0}
      textAlign="left"
    />
    {subtitle && (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
      >
        <TextType 
          as="p"
          className="text-secondary max-w-2xl"
          text={subtitle}
          typingSpeed={30}
          startOnVisible={true}
          loop={false}
          showCursor={false}
        />
      </motion.div>
    )}
  </div>
);

const ExperienceCard = ({ role, company, period, description, index }: any) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1 }}
    className="relative pl-8 pb-12 border-l border-white/10 last:pb-0"
  >
    <div className="absolute left-[-5px] top-0 w-[10px] h-[10px] rounded-full bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 gap-2">
      <h3 className="font-display text-2xl md:text-3xl font-bold text-primary">{role}</h3>
      <span className="text-sm font-mono text-primary bg-primary/10 px-3 py-1 rounded-full w-fit">
        {period}
      </span>
    </div>
    <p className="font-display text-lg md:text-xl text-orange-300 mb-4 font-medium">{company}</p>
    <p className="font-sans text-base md:text-lg text-slate-400 leading-relaxed max-w-3xl">{description}</p>
  </motion.div>
);

const ProjectCard = ({ title, description, tags, link, index }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1 }}
    className="group relative glass rounded-2xl p-8 hover:border-primary/50 transition-all duration-500 overflow-hidden"
  >
    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
      <ArrowUpRight className="text-primary" />
    </div>
    <h3 className="font-display text-2xl md:text-3xl font-bold mb-4 text-primary group-hover:text-orange-300 transition-colors">{title}</h3>
    <p className="font-sans text-base md:text-lg text-slate-400 mb-6 leading-relaxed">{description}</p>
    <div className="flex flex-wrap gap-2">
      {tags.map((tag: string) => (
        <span key={tag} className="text-xs font-mono px-3 py-1 bg-white/5 rounded-full border border-white/10">
          {tag}
        </span>
      ))}
    </div>
    <a href={link} className="absolute inset-0 z-10" target="_blank" rel="noopener noreferrer" />
  </motion.div>
);

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] as any }
  }
};

export default function App() {
  const { scrollYProgress, scrollY } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Subtle scrolling effect for the name
  const nameY = useTransform(scrollY, [0, 500], [0, 100]);
  const nameOpacity = useTransform(scrollY, [0, 400], [1, 0.2]);

  const experiences = [
    {
      role: "Software Developer Intern",
      company: "IBM",
      period: "Incoming Summer 2026",
      description: "Offered at 18 years old. Incoming Summer 2026 internship as SDE."
    },
    {
      role: "Software Engineering Intern",
      company: "TANTV Studios",
      period: "2024 - Present",
      description: "Built core infrastructure for the SyndexAI platform, leading development of a publisher dashboard and implementing authentication, AI summaries, caching, analytics, and scalable UI systems across two Next.js applications."
    },
    {
      role: "Distinguished Undergraduate Student Researcher",
      company: "Harvard Medical School / Massachusetts General Hospital",
      period: "2024 - Present",
      description: "Recognized for research contributions in clinical, biomechanical, and bioengineering innovation at FARIL."
    },
    {
      role: "Machine Learning Researcher",
      company: "Foot and Ankle Innovation Lab @ Harvard Medical School",
      period: "2023 - 2024",
      description: "Implemented CNNs for anatomical landmark detection on 3000+ radiographs. Achieved 94% SDR with Grad-CAM interpretability, reducing surgeon review time by 30%."
    },
    {
      role: "Machine Learning Researcher",
      company: "Pocket AI @ Colubri Lab (UMass Chan Medical School)",
      period: "2023",
      description: "Engineered ML-powered diagnostic feature for healthcare screening. Integrated SHAP interpretability, raising clinician trust scores by 35%."
    },
    {
      role: "Prompt Engineer",
      company: "AI Edge Lab @ Harvard School of Engineering",
      period: "2023",
      description: "Collaborated on LLM development for chip architecture design. Labeled 550+ data points with NLP optimization, reducing API costs."
    }
  ];

  const projects = [
    {
      title: "Olympus",
      description: "Platform to control AWS cloud resources through natural language via NVIDIA's Nemotron LLM, MCP, and Terraform.",
      tags: ["AWS", "LLM", "Terraform", "NVIDIA"],
      link: "#"
    },
    {
      title: "BiteSwipe",
      description: "Swipe-based restaurant discovery platform using Yelp API. Handles >10k swipes/min with optimized caching and query logic.",
      tags: ["Next.js", "Yelp API", "Redis", "Full-stack"],
      link: "#"
    },
    {
      title: "Converso",
      description: "Voice-driven learning platform built with Next.js and VAPI. 100+ daily interactive sessions with 50+ paying users in beta.",
      tags: ["Next.js", "VAPI", "AI", "SaaS"],
      link: "#"
    },
    {
      title: "AutoHDR",
      description: "Automatic lens barrel distortion correction without a lens profile, using a FeGAN flow-map architecture and a custom geometry-weighted loss.",
      tags: ["Deep Learning", "Computer Vision", "Python"],
      link: "#"
    }
  ];

  return (
    <div className="min-h-screen selection:bg-primary/30 relative">
      <div className="fixed inset-0 z-[-1]">
        <DotGrid
          dotSize={5}
          gap={15}
          baseColor="#1a1a1a"
          activeColor="#f97316"
          proximity={120}
          shockRadius={250}
          shockStrength={5}
          resistance={750}
          returnDuration={1.5}
        />
      </div>
      <CustomCursor />
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-primary z-[60] origin-left"
        style={{ scaleX }}
      />
      
      <Navbar />

      {/* Hero Section */}
      <section id="hero" className="min-h-screen flex flex-col justify-center section-padding relative overflow-hidden pt-32">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -z-10 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px] -z-10" />
        
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-4xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-primary mb-8">
              <Sparkles size={14} />
              <span>Available for Summer 2026 Internships</span>
            </div>
            
            <motion.div 
              style={{ y: nameY, opacity: nameOpacity }}
              className="text-4xl md:text-6xl font-name font-bold mb-6 tracking-tighter leading-tight"
            >
              <TrueFocus 
                sentence="Jyotiranjan Mishra" 
                manualMode={false} 
                blurAmount={5} 
                borderColor="#f97316" 
                glowColor="rgba(249, 115, 22, 0.6)" 
                animationDuration={0.5} 
                pauseBetweenAnimations={1} 
              />
            </motion.div>
            
            <div className="mb-8">
              <div className="text-xl md:text-2xl text-secondary font-medium max-w-2xl flex items-center gap-2 flex-wrap">
                <RotatingText
                  texts={['Software Engineer', 'Data Scientist', 'Fullstack Developer']}
                  mainClassName="text-primary font-bold px-2 sm:px-2 md:px-3 bg-primary/10 rounded-lg overflow-hidden py-0.5 sm:py-1 md:py-2 justify-start w-[220px] sm:w-[250px] md:w-[310px]"
                  staggerFrom="last"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "-120%" }}
                  staggerDuration={0.025}
                  splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                  transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  rotationInterval={2000}
                />
                <span>| CSE(Data Science) @ Institute of Technical Education and Research (ITER), SOA University</span>
              </div>
              <a 
                href="https://maps.app.goo.gl/Q8vaYagzmN6eu4GK7" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-secondary mt-2 hover:text-primary transition-colors cursor-pointer"
              >
                <MapPin size={16} className="text-primary" />
                <span className="text-base">Bhubaneswar, Odisha</span>
              </a>
            </div>
            
            <TextType 
              as="p"
              className="font-sans text-lg md:text-xl text-slate-400 mb-10 max-w-xl leading-relaxed"
              text="Hi, I'm Jyotiranjan. I'm passionate about building ML-driven software solutions that solve real-world problems."
              typingSpeed={30}
              startOnVisible={true}
              loop={false}
              showCursor={false}
            />
            
            <div className="flex flex-wrap gap-6 items-center">
              <motion.a 
                href="#projects" 
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="px-8 py-4 bg-transparent border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary/5 transition-colors flex items-center gap-2 group"
              >
                View Projects
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </motion.a>
              <div className="flex items-center gap-3">
                {[
                  { icon: Github, href: "https://github.com/jyotiranjanmishra915-lab" },
                  { icon: Linkedin, href: "https://www.linkedin.com/in/jyotiranjan-mishra-07815a3ab?utm_source=share_via&utm_content=profile&utm_medium=member_android" },
                  { icon: Instagram, href: "https://www.instagram.com/jyotiranjanmishra915?igsh=MnliMmtnZ215cWxt" },
                  { icon: Mail, href: "mailto:jyotiranjanmishra915@gmail.com" }
                ].map((social, i) => (
                  <motion.a 
                    key={i}
                    href={social.href} 
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-12 h-12 flex items-center justify-center rounded-xl glass border border-white/10 hover:border-primary/30 hover:text-primary hover:shadow-[0_0_15px_rgba(249,115,22,0.2)]"
                  >
                    <social.icon size={20} />
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="flex justify-center lg:justify-end"
          >
            <DecayCard width={450} height={600} image="/profile.jpg" />
          </motion.div>
        </div>
      </section>

      {/* What I Do & Building Now Section */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={{
          hidden: { 
            opacity: 0, 
            clipPath: "inset(100% 0% 0% 0%)",
            filter: "brightness(2) blur(20px)"
          },
          visible: { 
            opacity: 1, 
            clipPath: "inset(0% 0% 0% 0%)",
            filter: "brightness(1) blur(0px)",
            transition: { 
              duration: 1.2, 
              ease: [0.22, 1, 0.36, 1],
              staggerChildren: 0.15
            } 
          }
        }}
        className="section-padding relative"
      >
        {/* Futuristic Background Grid */}
        <div className="absolute inset-0 -z-20 opacity-20" 
             style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(249,115,22,0.15) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        
        <div className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* What I Do Card */}
            <div 
              className="lg:col-span-2 glass rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group border-white/5 flex flex-col"
            >
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10 group-hover:bg-primary/10 transition-colors duration-1000" />
              
              <div className="flex items-center gap-4 mb-12">
                <motion.div 
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="p-3 bg-orange-500/10 rounded-xl"
                >
                  <Trophy className="text-primary" size={28} />
                </motion.div>
                <Shuffle
                  text="What I Do"
                  tag="h2"
                  className="text-3xl font-bold tracking-tight"
                  shuffleDirection="right"
                  duration={0.35}
                  animationMode="evenodd"
                  shuffleTimes={1}
                  ease="power3.out"
                  stagger={0.03}
                  threshold={0.1}
                  triggerOnce={true}
                  triggerOnHover={true}
                  respectReducedMotion={true}
                  loop={false}
                  loopDelay={0}
                  textAlign="left"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1">
                {[
                  {
                    title: "Full-Stack",
                    tag: "Web & SaaS",
                    desc: "Next.js, Supabase, Stripe — shipping real products with real users."
                  },
                  {
                    title: "ML Research",
                    tag: "Deep Learning",
                    desc: "CNNs, PyTorch, Grad-CAM — applied at Harvard Med School."
                  },
                  {
                    title: "Product",
                    tag: "0 → 1",
                    desc: "From idea to deployment. 50+ paying users on Converso in month one."
                  }
                ].map((item, i) => (
                  <TiltCard 
                    key={i}
                    className="liquid-glass-card rounded-3xl p-8 transition-all duration-500 h-full"
                  >
                    <div className="flex flex-col h-full">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-display font-bold text-xl md:text-2xl text-primary">{item.title}</h3>
                        <Tilt tiltEnable={false} scale={1.15} transitionSpeed={2500}>
                          <span className="text-[10px] font-mono px-2 py-1 bg-orange-500/10 text-primary rounded-full border border-orange-500/20 inline-block">
                            {item.tag}
                          </span>
                        </Tilt>
                      </div>
                      <p className="font-sans text-base text-slate-400 leading-relaxed flex-1">
                        {item.desc}
                      </p>
                    </div>
                  </TiltCard>
                ))}
              </div>
            </div>

            {/* Building Now Card */}
            <div 
              className="glass rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group border-primary/10 flex flex-col"
            >
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/5 rounded-full blur-[80px] -z-10" />
              
              <div className="flex items-center gap-4 mb-12">
                <motion.div 
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="p-3 bg-orange-500/10 rounded-xl"
                >
                  <Rocket className="text-primary" size={28} />
                </motion.div>
                <Shuffle
                  text="Building Now"
                  tag="h2"
                  className="text-3xl font-bold tracking-tight"
                  shuffleDirection="right"
                  duration={0.35}
                  animationMode="evenodd"
                  shuffleTimes={1}
                  ease="power3.out"
                  stagger={0.03}
                  threshold={0.1}
                  triggerOnce={true}
                  triggerOnHover={true}
                  respectReducedMotion={true}
                  loop={false}
                  loopDelay={0}
                  textAlign="left"
                />
              </div>

              <TiltCard 
                className="liquid-glass-card rounded-3xl p-8 transition-all duration-500 group/item flex flex-col items-start flex-1"
              >
                <Shuffle
                  text="Amp'd"
                  tag="h3"
                  className="font-display font-bold text-2xl md:text-3xl mb-3 text-primary group-hover/item:text-orange-300 transition-colors"
                  shuffleDirection="right"
                  duration={0.35}
                  animationMode="evenodd"
                  shuffleTimes={1}
                  ease="power3.out"
                  stagger={0.03}
                  threshold={0.1}
                  triggerOnce={true}
                  triggerOnHover={true}
                  respectReducedMotion={true}
                  loop={false}
                  loopDelay={0}
                  textAlign="left"
                />
                <p className="font-sans text-base md:text-lg text-slate-400 leading-relaxed mb-8 flex-1">
                  Your all in one party-finding app.
                </p>
                <Tilt tiltEnable={false} scale={1.15} transitionSpeed={2500}>
                  <motion.button 
                    whileHover={{ 
                      boxShadow: "0 0 20px rgba(249,115,22,0.4)",
                      backgroundColor: "rgba(249,115,22,1)"
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3 bg-primary/80 text-black font-bold rounded-xl text-sm transition-all duration-300 opacity-70 hover:opacity-100 flex items-center gap-2 group/btn"
                  >
                    View App
                    <ArrowUpRight size={16} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                  </motion.button>
                </Tilt>
              </TiltCard>
              
              <div className="mt-12 flex justify-center">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                  className="h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" 
                />
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* About Section */}
      <motion.section 
        id="about" 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
        className="section-padding"
      >
        <div className="w-full">
          <SectionHeading subtitle="A quick look into my background and what drives me.">
            About Me
          </SectionHeading>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-stretch">
            <div className="flex flex-col justify-start space-y-8 text-xl text-secondary leading-relaxed py-4">
              <TextType 
                as="p"
                text="I'm a CS Data Science student at ITER, SOA University who got serious about software at 18 and never really stopped. I started small python and Java scripts and worked my way up to full-stack SaaS apps, ML research, Data analytics and Data management at ITER  — all before graduation."
                typingSpeed={15}
                startOnVisible={true}
                loop={false}
                showCursor={false}
              />
              <TextType 
                as="p"
                text="I like working on hard problems that matter — whether that's reducing surgeon review time with deep learning or shipping a voice-based learning platform that people actually pay for."
                typingSpeed={15}
                startOnVisible={true}
                loop={false}
                showCursor={false}
                initialDelay={1500}
              />
              <TextType 
                as="p"
                text="I care about the details: clean code, thoughtful UX, and products that work reliably at scale."
                typingSpeed={15}
                startOnVisible={true}
                loop={false}
                showCursor={false}
                initialDelay={3000}
              />
            </div>
            <div className="hidden lg:flex justify-center items-start -mt-[150px]">
              <HangingIDCard />
            </div>
          </div>

          {/* Skills Gallery */}
          <div className="mt-24" style={{ height: '600px', position: 'relative' }}>
            <CircularGallery 
              items={[
                { image: 'https://picsum.photos/seed/datascience/800/600?grayscale', text: 'Data Science' },
                { image: 'https://picsum.photos/seed/webdev/800/600?grayscale', text: 'Web Development' },
                { image: 'https://picsum.photos/seed/appdev/800/600?grayscale', text: 'App Development' },
                { image: 'https://picsum.photos/seed/mlresearch/800/600?grayscale', text: 'ML Research' },
                { image: 'https://picsum.photos/seed/systemdesign/800/600?grayscale', text: 'System Design' },
                { image: 'https://picsum.photos/seed/fullstack/800/600?grayscale', text: 'Full Stack' }
              ]}
              bend={3} 
              textColor="#ffffff" 
              borderRadius={0.05} 
              scrollSpeed={2}
              scrollEase={0.05}
            />
          </div>
        </div>
      </motion.section>

      {/* Projects Section */}
      <motion.section 
        id="projects" 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
        className="section-padding"
      >
        <div className="w-full">
          <SectionHeading subtitle="Selected work ranging from ML research to full-stack applications.">
            Featured Projects
          </SectionHeading>
          <div className="mt-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {projects.map((project, index) => (
                <div key={index} className="rounded-3xl transition-all duration-500 group h-full">
                  <Tilt className="parallax-effect w-full h-full" perspective={1000} tiltMaxAngleX={5} tiltMaxAngleY={5} transitionSpeed={1000}>
                    <BorderGlow
                      edgeSensitivity={30}
                      glowColor="25 100 50"
                      backgroundColor="#0a0a0a"
                      borderRadius={24}
                      glowRadius={40}
                      glowIntensity={1}
                      coneSpread={25}
                      animated={false}
                      colors={['#f97316', '#fb923c', '#fdba74']}
                      className="h-full w-full"
                    >
                      <div className="inner-element p-8 md:p-10 h-full flex flex-col justify-between relative z-10 bg-transparent rounded-3xl">
                        <div>
                          <div className="flex justify-between items-start mb-6">
                            <Shuffle
                              text={project.title}
                              tag="h3"
                              className="font-display font-bold text-2xl md:text-3xl text-primary group-hover:text-orange-300 transition-colors"
                              shuffleDirection="right"
                              duration={0.35}
                              animationMode="evenodd"
                              shuffleTimes={1}
                              ease="power3.out"
                              stagger={0.03}
                              threshold={0.1}
                              triggerOnce={true}
                              triggerOnHover={true}
                              respectReducedMotion={true}
                              loop={false}
                              loopDelay={0}
                              textAlign="left"
                            />
                            <a href={project.link} className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all shrink-0 ml-4">
                              <ArrowUpRight size={24} />
                            </a>
                          </div>
                          <p className="font-sans text-base md:text-lg text-slate-400 mb-8 leading-relaxed">
                            {project.description}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2 md:gap-3 mt-auto">
                          {project.tags.map((tag, i) => (
                            <Tilt key={i} tiltEnable={false} scale={1.15} transitionSpeed={2500}>
                              <span className="px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white/5 text-xs md:text-sm font-medium text-secondary group-hover:text-white transition-colors inline-block">
                                {tag}
                              </span>
                            </Tilt>
                          ))}
                        </div>
                      </div>
                    </BorderGlow>
                  </Tilt>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-12 text-center">
            <a 
              href="#" 
              className="inline-flex items-center gap-2 text-primary font-bold hover:underline"
            >
              View All Projects <ArrowUpRight size={18} />
            </a>
          </div>
        </div>
      </motion.section>

      {/* Education Section */}
      <motion.section 
        id="education" 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
        className="section-padding bg-white/[0.01]"
      >
        <div className="w-full">
          <SectionHeading>Education</SectionHeading>
          <PixelCard variant="orange" className="w-full !rounded-[2rem] !bg-[#0f0f0f] !border-white/10">
            <div className="w-full p-8 md:p-12 flex flex-col md:flex-row gap-8 items-start">
              <motion.div 
                animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                className="flex-shrink-0 w-24 h-24 md:w-32 md:h-32 bg-black rounded-2xl border border-white/5 flex items-center justify-center overflow-hidden p-4"
              >
                <img 
                  src="/soa-logo.png" 
                  alt="Siksha 'O' Anusandhan Logo" 
                  className="w-full h-full object-contain"
                />
              </motion.div>
              
              <div className="flex-1 w-full">
                <div className="mb-8">
                  <Shuffle
                    text="Siksha 'O' Anusandhan"
                    tag="h3"
                    className="font-display font-bold text-3xl md:text-4xl mb-3 text-primary"
                    shuffleDirection="right"
                    duration={0.35}
                    animationMode="evenodd"
                    shuffleTimes={1}
                    ease="power3.out"
                    stagger={0.03}
                    threshold={0.1}
                    triggerOnce={true}
                    triggerOnHover={true}
                    respectReducedMotion={true}
                    loop={false}
                    loopDelay={0}
                  />
                  <p className="font-display text-lg md:text-xl text-orange-300 flex items-center flex-wrap gap-3 mb-6">
                    Bachelor of Technology in Computer Science & Engineering (Data Science)
                    <span className="text-white/20 text-sm">•</span>
                    <span className="font-mono text-[#f97316] font-bold tracking-wider">CGPA: 8.56 / 10.0</span>
                  </p>
                </div>

                <div className="space-y-8">
                  <div>
                    <h4 className="font-display font-bold mb-4 flex items-center gap-2 text-primary text-xl md:text-2xl">
                      <Award size={20} className="text-primary/70" />
                      Involvement
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {[
                        "ITER Convergent - Build Team Tech Member",
                        "Cipher Developers - Developer Fellow",
                        "Virtual Showreel - Frontend Developer",
                        "IIT BBSR and SIH - Hackathon Participate"
                      ].map((item, i) => (
                        <Tilt key={i} tiltEnable={false} scale={1.15} transitionSpeed={2500}>
                          <span className="bg-[#2a1608] text-[#f97316] px-4 py-2 rounded-full text-sm font-medium inline-block">{item}</span>
                        </Tilt>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-display font-bold mb-4 flex items-center gap-2 text-primary text-xl md:text-2xl">
                      <BookOpen size={20} className="text-primary/70" />
                      Relevant Coursework
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {[
                        "CSE 2001: Data Structure & Algorithms",
                        "CSE 2221: Modern Computing System Design",
                        "CSE 1402: Practical Discrete Mathematics",
                        "MATH 2101: Calculus B",
                        "CSE1401: Applied Computational Thinking",
                        "CSE 2195: Data Science Workshop 1"
                      ].map((item, i) => (
                        <Tilt key={i} tiltEnable={false} scale={1.15} transitionSpeed={2500}>
                          <span className="bg-[#1e1e1e] text-[#a1a1aa] px-4 py-2 rounded-full text-sm font-medium inline-block">{item}</span>
                        </Tilt>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </PixelCard>
        </div>
      </motion.section>

      {/* Contact Section */}
      <motion.section 
        id="contact" 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
        className="section-padding relative overflow-hidden"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -z-10" />
        
        <div className="w-full overflow-hidden text-center mb-12">
          <h2 className="font-harmond text-[10vw] md:text-[8vw] lg:text-[7vw] font-bold tracking-tight leading-none cursor-default flex flex-col items-center justify-center gap-2 md:gap-4">
            <HoverSplitText 
              text="Let's Build Something" 
            />
            <HoverSplitText 
              text="Amazing" 
              highlightWord="Amazing" 
              highlightClass="gradient-text italic" 
            />
          </h2>
        </div>
        
        <div className="w-full text-center">
          <div className="min-h-[180px] sm:min-h-[120px] md:min-h-[84px] mb-12 flex items-start justify-center">
            <TextType 
              as="p"
              className="text-xl text-secondary leading-relaxed !block w-full"
              text="I'm always interested in interesting opportunities, collaborations, and conversations. Whether you want to discuss a project, ask a question, or just say hi—feel free to reach out."
              typingSpeed={20}
              startOnVisible={true}
              loop={false}
              showCursor={false}
            />
          </div>
          <a 
            href="mailto:jyotiranjanmishra915@gmail.com" 
            className="inline-flex items-center gap-3 px-12 py-6 bg-white text-black text-xl font-bold rounded-2xl hover:bg-white/90 transition-all hover:scale-105"
          >
            Say Hello
            <Mail size={24} />
          </a>
          
          <div className="mt-20 p-8 bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8 flex-wrap">
            <p className="font-sans text-slate-400 text-sm w-full md:w-auto text-center md:text-left">
              @ 2026 All rights reserved. Build by r001
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap w-full md:w-auto">
              {[
                { icon: Github, href: "https://github.com/jyotiranjanmishra915-lab" },
                { icon: Linkedin, href: "https://www.linkedin.com/in/jyotiranjan-mishra-07815a3ab?utm_source=share_via&utm_content=profile&utm_medium=member_android" },
                { icon: Instagram, href: "https://www.instagram.com/jyotiranjanmishra915?igsh=MnliMmtnZ215cWxt" },
                { icon: Mail, href: "mailto:jyotiranjanmishra915@gmail.com" }
              ].map((social, i) => (
                <motion.a 
                  key={i}
                  href={social.href} 
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 flex items-center justify-center rounded-lg glass border border-white/10 text-white hover:border-primary/30 hover:text-primary hover:shadow-[0_0_12px_rgba(249,115,22,0.15)] transition-colors"
                >
                  <social.icon size={18} />
                </motion.a>
              ))}
            </div>
            <a 
              href="#hero" 
              className="text-sm font-bold text-primary hover:text-orange-400 hover:underline flex items-center justify-center gap-2 w-full md:w-auto"
            >
              Back to Top <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
