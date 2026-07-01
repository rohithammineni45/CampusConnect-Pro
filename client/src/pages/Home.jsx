import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { FiSun, FiMoon, FiMenu, FiX, FiArrowRight, FiAward, FiUsers, FiBookOpen, FiCalendar } from 'react-icons/fi';
import { motion } from 'framer-motion';

const departments = [
  { name: 'Computer Science', icon: '💻', students: 420, courses: 12 },
  { name: 'Electronics & Comm.', icon: '📡', students: 380, courses: 10 },
  { name: 'Mechanical Engg.', icon: '⚙️', students: 350, courses: 11 },
  { name: 'Civil Engineering', icon: '🏗️', students: 300, courses: 9 },
  { name: 'Information Tech.', icon: '🌐', students: 390, courses: 10 },
  { name: 'Electrical Engg.', icon: '⚡', students: 280, courses: 8 },
];

const stats = [
  { label: 'Students Enrolled', value: '5,200+', icon: <FiUsers /> },
  { label: 'Faculty Members', value: '320+', icon: <FiBookOpen /> },
  { label: 'Courses Offered', value: '180+', icon: <FiAward /> },
  { label: 'Events Per Year', value: '50+', icon: <FiCalendar /> },
];

const faculty = [
  { name: 'Dr. R. Krishnamurthy', dept: 'Computer Science', role: 'HOD & Professor', img: '👨‍🏫' },
  { name: 'Dr. Priya Nair', dept: 'Electronics', role: 'Associate Professor', img: '👩‍🏫' },
  { name: 'Dr. S. Ramasamy', dept: 'Mechanical', role: 'Professor', img: '👨‍🔬' },
  { name: 'Dr. Lakshmi Devi', dept: 'Civil Engg.', role: 'Assistant Professor', img: '👩‍🔬' },
];

const testimonials = [
  { name: 'Arjun Sharma', dept: 'CSE 2024', text: 'CampusConnect Pro transformed how I manage attendance, fees, and events. Best campus platform!', rating: 5 },
  { name: 'Priya Rajan', dept: 'ECE 2024', text: 'The event management system is seamless. Got notified instantly when my registration was approved.', rating: 5 },
  { name: 'Karthik M.', dept: 'MECH 2023', text: 'The dashboard analytics helped me track my academic performance beautifully. Love the dark mode!', rating: 5 },
];

const placements = [
  { company: 'Google', package: '42 LPA', logo: '🔵' },
  { company: 'Microsoft', package: '38 LPA', logo: '🟦' },
  { company: 'Amazon', package: '35 LPA', logo: '🟠' },
  { company: 'Infosys', package: '18 LPA', logo: '🟢' },
  { company: 'TCS', package: '12 LPA', logo: '⚪' },
  { company: 'Wipro', package: '10 LPA', logo: '🔷' },
];

const navLinks = ['About', 'Departments', 'Courses', 'Events', 'Placements', 'Contact'];

export default function Home() {
  const { isDark, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-slate-900/95 backdrop-blur-xl shadow-xl border-b border-slate-800' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center font-bold text-white text-lg">C</div>
              <span className="font-display font-bold text-xl gradient-text">CampusConnect Pro</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map(l => (
                <a key={l} href={`#${l.toLowerCase()}`} className="text-slate-400 hover:text-white text-sm font-medium transition-colors">{l}</a>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button onClick={toggleTheme} className="btn-icon text-slate-400 hover:text-white">
                {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
              </button>
              <Link to="/student/login" className="hidden sm:block btn-secondary text-sm px-4 py-2">Student Login</Link>
              <Link to="/admin/login" className="btn-primary text-sm px-4 py-2">Admin Login</Link>
              <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden btn-icon text-slate-400">
                {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
              </button>
            </div>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-slate-900 border-t border-slate-800 px-4 py-4 space-y-2">
            {navLinks.map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} className="block text-slate-400 hover:text-white py-2 text-sm" onClick={() => setMenuOpen(false)}>{l}</a>
            ))}
            <Link to="/student/login" className="block btn-secondary text-sm text-center mt-2">Student Login</Link>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-primary-950/30 to-slate-950" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-pulse-slow animate-delay-500" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-3xl" />
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto pt-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/30 text-primary-400 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              🎓 Welcome to the Future of Campus Management
            </span>
            <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Shaping Tomorrow's <br />
              <span className="gradient-text">Leaders Today</span>
            </h1>
            <p className="text-slate-400 text-xl md:text-2xl mb-10 max-w-3xl mx-auto leading-relaxed">
              Vel Tech Rangarajan Dr. Sagunthala R&D Institute of Science and Technology is a Deemed-to-be University located in Avadi, Chennai, Tamil Nadu. It was established in 1997 — Vel Tech has modern laboratories, research centers, digital libraries, innovation hubs, and industry collaborations that help students gain practical knowledge. The university also encourages students to participate in internships, certification programs, hackathons, research projects, and placement training.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/student/login" className="btn-primary text-base px-8 py-4 flex items-center gap-2 justify-center">
                Student Portal <FiArrowRight />
              </Link>
              <Link to="/admin/login" className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 flex items-center gap-2 justify-center">
                Admin Portal <FiArrowRight />
              </Link>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
            {stats.map((s, i) => (
              <div key={i} className="glass rounded-2xl p-4 text-center">
                <div className="text-3xl font-display font-bold gradient-text">{s.value}</div>
                <div className="text-slate-400 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-slate-600 rounded-full flex justify-center pt-2">
            <div className="w-1 h-3 bg-primary-500 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24 bg-slate-900">
        <div className="section-container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-primary-400 text-sm font-semibold tracking-widest uppercase">About Us</span>
              <h2 className="section-title text-white mt-3 mb-6">Excellence in Education Since 1985</h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-6">
Vel Tech Rangarajan Dr. Sagunthala R&D Institute of Science and Technology has been accredited by NAAC with an A++ Grade, which reflects its strong performance in academics, research, infrastructure, innovation, and student support.              </p>
              <p className="text-slate-400 leading-relaxed mb-8">
                Our state-of-the-art infrastructure, dedicated faculty, and industry partnerships ensure that students receive both theoretical knowledge and practical exposure to excel in their careers.
              </p>
              <div className="grid grid-cols-3 gap-4">
                {[['NAAC A+', 'Accredited'], ['NBA', 'Certified'], ['40 Years', 'of Excellence']].map(([v, l]) => (
                  <div key={l} className="text-center p-4 bg-slate-800 rounded-xl">
                    <div className="font-display font-bold text-xl gradient-text">{v}</div>
                    <div className="text-slate-500 text-xs mt-1">{l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {['🏛️ Modern Campus', '🔬 Research Labs', '📚 Digital Library', '🏋️ Sports Complex', '🎭 Cultural Center', '🌐 Wi-Fi Campus'].map((item, i) => (
                <div key={i} className="bg-slate-800 hover:bg-slate-700 rounded-xl p-4 flex items-center gap-3 transition-colors cursor-default">
                  <span className="text-2xl">{item.split(' ')[0]}</span>
                  <span className="text-slate-300 text-sm font-medium">{item.split(' ').slice(1).join(' ')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Departments */}
      <section id="departments" className="py-24 bg-slate-950">
        <div className="section-container">
          <div className="text-center mb-16">
            <span className="text-primary-400 text-sm font-semibold tracking-widest uppercase">Departments</span>
            <h2 className="section-title text-white mt-3">World-Class Departments</h2>
            <p className="text-slate-400 mt-4 max-w-2xl mx-auto">Six specialized engineering departments with industry-aligned curricula and research opportunities.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((d, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className="group bg-slate-900 hover:bg-gradient-to-br hover:from-primary-900/30 hover:to-accent-900/10 border border-slate-800 hover:border-primary-700/50 rounded-2xl p-6 transition-all duration-300 cursor-default">
                <div className="text-4xl mb-4">{d.icon}</div>
                <h3 className="font-display font-bold text-white text-lg mb-2">{d.name}</h3>
                <div className="flex gap-4 text-slate-400 text-sm">
                  <span>👥 {d.students} students</span>
                  <span>📚 {d.courses} courses</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Placements */}
      <section id="placements" className="py-24 bg-slate-900">
        <div className="section-container">
          <div className="text-center mb-16">
            <span className="text-primary-400 text-sm font-semibold tracking-widest uppercase">Placements</span>
            <h2 className="section-title text-white mt-3">Outstanding Placement Records</h2>
            <div className="grid grid-cols-3 gap-6 mt-10 max-w-2xl mx-auto">
              {[['95%', 'Placement Rate'], ['₹18 LPA', 'Avg Package'], ['200+', 'Companies']].map(([v, l]) => (
                <div key={l} className="text-center">
                  <div className="font-display font-bold text-4xl gradient-text-gold">{v}</div>
                  <div className="text-slate-400 text-sm mt-2">{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {placements.map((p, i) => (
              <div key={i} className="bg-slate-800 rounded-xl p-4 text-center hover:scale-105 transition-transform cursor-default">
                <div className="text-3xl mb-2">{p.logo}</div>
                <div className="text-white font-semibold text-sm">{p.company}</div>
                <div className="text-emerald-400 text-xs font-bold mt-1">{p.package}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Faculty */}
      <section id="faculty" className="py-24 bg-slate-950">
        <div className="section-container">
          <div className="text-center mb-16">
            <span className="text-primary-400 text-sm font-semibold tracking-widest uppercase">Faculty</span>
            <h2 className="section-title text-white mt-3">Expert Faculty Members</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {faculty.map((f, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center hover:border-primary-700/50 transition-colors">
                <div className="text-5xl mb-4">{f.img}</div>
                <h3 className="text-white font-semibold">{f.name}</h3>
                <p className="text-primary-400 text-sm mt-1">{f.role}</p>
                <p className="text-slate-500 text-xs mt-1">{f.dept}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-slate-900">
        <div className="section-container">
          <div className="text-center mb-16">
            <span className="text-primary-400 text-sm font-semibold tracking-widest uppercase">Testimonials</span>
            <h2 className="section-title text-white mt-3">What Students Say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => <span key={j} className="text-amber-400">★</span>)}
                </div>
                <p className="text-slate-300 leading-relaxed mb-4">"{t.text}"</p>
                <div className="font-semibold text-white">{t.name}</div>
                <div className="text-slate-500 text-sm">{t.dept}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-24 bg-slate-950">
        <div className="section-container">
          <div className="max-w-2xl mx-auto text-center">
            <span className="text-primary-400 text-sm font-semibold tracking-widest uppercase">Contact</span>
            <h2 className="section-title text-white mt-3 mb-8">Get In Touch</h2>
            <div className="grid grid-cols-3 gap-4 mb-10">
              {[['📍', 'Address', 'Avadi, Chennai – 600054'],
                ['📞', 'Phone', '+91 XXXXXXXXXX'],
                ['✉️', 'Email', 'info@veltech.edu.in']].map(([icon, label, value]) => (
                <div key={label} className="bg-slate-900 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-2">{icon}</div>
                  <div className="text-slate-500 text-xs mb-1">{label}</div>
                  <div className="text-slate-300 text-xs">{value}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/student/login" className="btn-primary flex items-center gap-2 justify-center px-8 py-4">
                🎓 Student Portal <FiArrowRight />
              </Link>
              <Link to="/student/register" className="btn-secondary flex items-center gap-2 justify-center px-8 py-4 dark:text-white dark:border-slate-600">
                📝 Register Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-8">
        <div className="section-container text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center font-bold text-white">C</div>
            <span className="font-display font-bold text-lg gradient-text">CampusConnect Pro</span>
          </div>
          <p className="text-slate-500 text-sm">© 2026 Vel Tech Rangarajan Dr. Sagunthala R&D Institute of Science and Technology. All rights reserved.</p>
          <p className="text-slate-600 text-xs mt-2">Built with ❤️ using React.js, Node.js & MongoDB By Rohith</p>
        </div>
      </footer>
    </div>
  );
}
