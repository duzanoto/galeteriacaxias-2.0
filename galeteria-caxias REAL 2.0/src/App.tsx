import { motion } from "motion/react";
import { Menu, X, Phone, Instagram, MapPin, Clock } from "lucide-react";
import { useState, FormEvent } from "react";

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    data: "",
    pessoas: "2",
    observacoes: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nome.trim()) newErrors.nome = "Nome é obrigatório";
    if (!formData.telefone.trim()) newErrors.telefone = "Telefone é obrigatório";
    if (!formData.data) newErrors.data = "Data é obrigatória";
    if (!formData.pessoas || parseInt(formData.pessoas) < 1) newErrors.pessoas = "Mínimo 1 pessoa";
    
    // Simple date validation: must be today or in the future
    if (formData.data) {
      const selectedDate = new Date(formData.data);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.data = "A data deve ser hoje ou no futuro";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/reserve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsSuccess(true);
        setFormData({ nome: "", telefone: "", data: "", pessoas: "2", observacoes: "" });
      } else {
        console.error("Erro ao enviar reserva");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
    } finally {
      setIsSubmitting(false);
    }
    
    // Hide success message after 5 seconds
    setTimeout(() => setIsSuccess(false), 5000);
  };

  const menuItems = [
    { name: "O Galeto", id: "hero" },
    { name: "Menu", id: "menu" },
    { name: "Galeria", id: "gallery" },
    { name: "Contato", id: "contact" },
  ];

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen selection:bg-brand-olive selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-brand-cream/80 backdrop-blur-md border-b border-brand-ink/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div 
            className="text-2xl font-bold tracking-tight cursor-pointer font-serif"
            onClick={() => scrollTo("hero")}
          >
            Galeteria <span className="text-brand-olive font-medium">Caxias</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="text-sm font-medium uppercase tracking-widest text-brand-ink/70 hover:text-brand-olive transition-colors underline-offset-8 hover:underline"
              >
                {item.name}
              </button>
            ))}
            <a 
              href="#contact" 
              onClick={(e) => { e.preventDefault(); scrollTo("contact"); }}
              className="px-6 py-2 bg-brand-olive text-white rounded-full text-sm font-medium hover:bg-brand-olive/90 transition-all shadow-lg shadow-brand-olive/20"
            >
              Reservar
            </a>
          </div>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden text-brand-ink"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden absolute top-20 left-0 w-full bg-brand-cream border-b border-brand-ink/5 px-6 py-8 flex flex-col gap-6"
          >
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="text-lg font-serif text-brand-ink text-left"
              >
                {item.name}
              </button>
            ))}
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="hero" className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-brand-olive font-medium tracking-[0.3em] uppercase text-xs mb-4 block">
              Tradição Italiana desde 1991
            </span>
            <h1 className="text-6xl md:text-8xl font-bold leading-tight mb-8">
              A Essência do <br />
              <span className="italic font-normal italic text-brand-rust">Galeto al Primo Canto</span>
            </h1>
            <p className="text-lg text-brand-ink/70 max-w-lg mb-10 leading-relaxed">
              O autêntico sabor da Serra Gaúcha, preparado com carinho e tradição. 
              Nossas receitas são passadas de geração em geração para trazer à sua mesa 
              o melhor da gastronomia ítalo-brasileira.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => scrollTo("menu")}
                className="px-8 py-4 bg-brand-olive text-white rounded-full font-medium hover:scale-105 active:scale-95 transition-all text-lg shadow-xl shadow-brand-olive/30"
              >
                Conheça o Cardápio
              </button>
              <button 
                onClick={() => scrollTo("contact")}
                className="px-8 py-4 border-2 border-brand-olive text-brand-olive rounded-full font-medium hover:bg-brand-olive hover:text-white transition-all text-lg"
              >
                Falar com a gente
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="relative"
          >
            <div className="relative z-10">
              <img 
                src="/src/assets/images/regenerated_image_1778292583432.png" 
                alt="Galeto Assado" 
                className="pill-image w-full shadow-2xl"
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Decorative dots */}
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-zinc-200 rounded-full -z-0 blur-2xl opacity-50" />
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-olive/20 rounded-full -z-0 blur-2xl opacity-50" />
          </motion.div>
        </div>
      </section>

      {/* Features/Highlights */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <div className="w-16 h-16 bg-brand-cream rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-serif text-brand-olive font-bold">01</span>
              </div>
              <h3 className="text-2xl font-bold">Produção Local</h3>
              <p className="text-brand-ink/60">Ingredientes selecionados de produtores locais para garantir o frescor absoluto.</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <div className="w-16 h-16 bg-brand-cream rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-serif text-brand-olive font-bold">02</span>
              </div>
              <h3 className="text-2xl font-bold">Tradição</h3>
              <p className="text-brand-ink/60">Nosso tempero é único, passado de geração em geração e aperfeiçoado por décadas.</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              <div className="w-16 h-16 bg-brand-cream rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-serif text-brand-olive font-bold">03</span>
              </div>
              <h3 className="text-2xl font-bold">Ambiente Familiar</h3>
              <p className="text-brand-ink/60">Um lugar onde você se sente em casa, ideal para momentos inesquecíveis.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="py-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">Nosso Cardápio</h2>
            <div className="w-24 h-1 bg-brand-olive mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
            {/* Food Menu */}
            <div className="space-y-12">
              <div>
                <h3 className="text-3xl font-bold mb-8 italic border-b border-brand-ink/10 pb-4">Rodízio Completo</h3>
                <div className="space-y-6 bg-brand-cream/30 p-8 rounded-[2rem] border border-brand-olive/10 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-olive/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-2xl font-bold text-brand-olive mb-1">Experiência Tradicional</h4>
                        <p className="text-sm text-brand-ink/50 italic">Servido à vontade</p>
                      </div>
                    </div>
                    <p className="text-brand-ink/70 leading-relaxed mb-6">
                      Uma verdadeira jornada gastronômica que inclui <span className="font-bold text-brand-ink">todos os itens do nosso cardápio</span>, servidos em sequência para que você aprecie cada sabor no seu tempo.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {["Sopa de Capeletti", "Galeto", "Espaguete", "Risoto", "Polenta", "Salada", "Tortéi", "Maionese", "Costelinhas de porco"].map((item) => (
                        <span key={item} className="px-3 py-1 bg-brand-olive/10 text-brand-olive text-xs font-bold rounded-full uppercase tracking-wider">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-3xl font-bold mb-8 italic border-b border-brand-ink/10 pb-4">Cardápio</h3>
                <div className="space-y-4">
                  {[
                    "Galeto ao Primo Canto",
                    "Espaguete ao molho de moela",
                    "Polenta recheada c/queijo",
                    "Risoto de Frango",
                    "Maionese de batata",
                    "Sopa de Capeletti ao Brôdo",
                    "Costelinhas de Porco",
                    "Tortéi de Abóbora",
                    "Salada Verde"
                  ].map((item, idx) => (
                    <div key={idx} className="flex justify-between items-end border-b border-dashed border-brand-ink/20 pb-2">
                      <h4 className="text-lg font-medium">{item}</h4>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-3xl font-bold mb-8 italic border-b border-brand-ink/10 pb-4">Sobremesas</h3>
                <div className="space-y-4">
                  {[
                    "Sagú de vinho tinto",
                    "Pudim de Leite Condensado",
                    "Creme de Papaia",
                    "Petit Gâteau",
                    "Mousse de maracujá",
                    "Strogonoff de nozes"
                  ].map((item, idx) => (
                    <div key={idx} className="flex justify-between items-end border-b border-dashed border-brand-ink/20 pb-2">
                      <h4 className="text-lg font-medium">{item}</h4>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Food Image Collage */}
            <div className="grid grid-cols-2 gap-4 h-fit self-start">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-brand-cream/40 rounded-3xl overflow-hidden flex items-center justify-center p-2 shadow-inner"
              >
                <img 
                  src="/src/assets/images/regenerated_image_1778292581480.png"
                  alt="Massa Italiana"
                  className="w-full h-auto object-contain rounded-2xl"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="bg-brand-cream/40 rounded-3xl overflow-hidden flex items-center justify-center p-2 shadow-inner"
                >
                  <img 
                    src="/src/assets/images/regenerated_image_1778292585422.png"
                    alt="Polenta"
                    className="w-full h-auto object-contain rounded-2xl"
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="bg-brand-cream/40 rounded-3xl overflow-hidden flex items-center justify-center p-2 shadow-inner"
                >
                  <img 
                    src="/src/assets/images/regenerated_image_1778292587382.png"
                    alt="Salada"
                    className="w-full h-auto object-contain rounded-2xl"
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-24 bg-brand-ink text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="text-brand-olive uppercase tracking-widest text-sm font-medium mb-4 block"></span>
              <h2 className="text-5xl md:text-7xl font-bold italic">Galeria de Sabores</h2>
            </div>
            <p className="max-w-xs text-white/50 text-sm italic">Um vislumbre do que espera por você.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "/src/assets/images/regenerated_image_1778291081076.png",
              "/src/assets/images/regenerated_image_1778291082817.jpg",
              "/src/assets/images/regenerated_image_1778291083688.jpg",
              "/src/assets/images/regenerated_image_1778291084500.jpg",
              "/src/assets/images/regenerated_image_1778291080196.jpg",
              "/src/assets/images/regenerated_image_1778292589254.png",
              "/src/assets/images/regenerated_image_1778292590945.png",
              "/src/assets/images/regenerated_image_1778292592524.png",
            ].map((src, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="aspect-square overflow-hidden rounded-2xl group cursor-crosshair"
              >
                <img 
                  src={src} 
                  alt={`Galeria ${idx}`} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reservation/Contact Section */}
      <section id="contact" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-brand-cream border border-brand-ink/5 rounded-[3rem] p-12 md:p-20 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-olive/5 rounded-full blur-3xl -mr-32 -mt-32" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <div>
                <h2 className="text-5xl font-bold mb-8">Reserve sua mesa</h2>
                <p className="text-brand-ink/70 mb-12 text-lg">
                  Estamos prontos para receber você e sua família para uma experiência inesquecível.
                  Entre em contato por telefone ou visite-nos.
                </p>

                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                      <MapPin className="text-brand-olive" size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Localização</h4>
                      <p className="text-brand-ink/60">Avenida Comendador Franco, 3077 <br />Curitiba - PR</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                      <Phone className="text-brand-olive" size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Telefone / WhatsApp</h4>
                      <p className="text-brand-ink/60 text-xl font-serif">(41) 3266-4443</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                      <Clock className="text-brand-olive" size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Horários</h4>
                      <p className="text-brand-ink/60">
                        Terça à Sábado: 11:30h - 14:30h | 19:00h - 22:30h<br />
                        Domingo: 11:00h - 15:30h
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                      <Instagram className="text-brand-olive" size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Siga-nos</h4>
                      <p className="text-brand-ink/60 underline cursor-pointer hover:text-brand-olive transition-colors">@galeteriacaxias</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-brand-ink/5 relative">
                {isSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute inset-0 bg-white/95 z-20 rounded-[2.5rem] flex flex-col items-center justify-center p-10 text-center"
                  >
                    <div className="w-20 h-20 bg-brand-olive/10 rounded-full flex items-center justify-center mb-6">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 12 }}
                      >
                        <svg className="w-10 h-10 text-brand-olive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Solicitação Enviada!</h3>
                    <p className="text-brand-ink/60 leading-relaxed">
                      Recebemos seu pedido de reserva. Entraremos em contato em breve para confirmar.
                    </p>
                    <button 
                      onClick={() => setIsSuccess(false)}
                      className="mt-8 text-brand-olive font-bold hover:underline"
                    >
                      Fazer outra reserva
                    </button>
                  </motion.div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div>
                    <label className="block text-sm font-semibold mb-2 uppercase tracking-wider text-brand-ink/50">Nome Completo</label>
                    <input 
                      type="text" 
                      value={formData.nome}
                      onChange={(e) => {
                        setFormData({...formData, nome: e.target.value});
                        if (errors.nome) setErrors({...errors, nome: ""});
                      }}
                      className={`w-full bg-brand-cream/50 border ${errors.nome ? 'border-red-500' : 'border-brand-ink/10'} rounded-2xl p-4 focus:ring-2 focus:ring-brand-olive/20 outline-none transition-all`}
                    />
                    {errors.nome && <p className="text-red-500 text-xs mt-1 font-medium">{errors.nome}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 uppercase tracking-wider text-brand-ink/50">Telefone</label>
                    <input 
                      type="tel" 
                      placeholder="(XX) XXXXX-XXXX"
                      value={formData.telefone}
                      onChange={(e) => {
                        setFormData({...formData, telefone: e.target.value});
                        if (errors.telefone) setErrors({...errors, telefone: ""});
                      }}
                      className={`w-full bg-brand-cream/50 border ${errors.telefone ? 'border-red-500' : 'border-brand-ink/10'} rounded-2xl p-4 focus:ring-2 focus:ring-brand-olive/20 outline-none transition-all`}
                    />
                    {errors.telefone && <p className="text-red-500 text-xs mt-1 font-medium">{errors.telefone}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 uppercase tracking-wider text-brand-ink/50">Data</label>
                      <input 
                        type="date" 
                        value={formData.data}
                        onChange={(e) => {
                          setFormData({...formData, data: e.target.value});
                          if (errors.data) setErrors({...errors, data: ""});
                        }}
                        className={`w-full bg-brand-cream/50 border ${errors.data ? 'border-red-500' : 'border-brand-ink/10'} rounded-2xl p-4 focus:ring-2 focus:ring-brand-olive/20 outline-none transition-all`}
                      />
                      {errors.data && <p className="text-red-500 text-xs mt-1 font-medium">{errors.data}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2 uppercase tracking-wider text-brand-ink/50">Pessoas</label>
                      <input 
                        type="number" 
                        min="1" 
                        value={formData.pessoas}
                        onChange={(e) => {
                          setFormData({...formData, pessoas: e.target.value});
                          if (errors.pessoas) setErrors({...errors, pessoas: ""});
                        }}
                        className={`w-full bg-brand-cream/50 border ${errors.pessoas ? 'border-red-500' : 'border-brand-ink/10'} rounded-2xl p-4 focus:ring-2 focus:ring-brand-olive/20 outline-none transition-all`} 
                      />
                      {errors.pessoas && <p className="text-red-500 text-xs mt-1 font-medium">{errors.pessoas}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 uppercase tracking-wider text-brand-ink/50">Observações</label>
                    <textarea 
                      value={formData.observacoes}
                      onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                      className="w-full bg-brand-cream/50 border border-brand-ink/10 rounded-2xl p-4 h-32 focus:ring-2 focus:ring-brand-olive/20 outline-none transition-all" 
                    />
                  </div>
                  <button 
                    disabled={isSubmitting}
                    className="w-full py-5 bg-brand-olive text-white rounded-2xl font-bold text-lg hover:bg-brand-olive/90 transition-all shadow-lg shadow-brand-olive/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        />
                        Processando...
                      </>
                    ) : 'Solicitar Reserva'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-brand-ink/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-xl font-bold font-serif">
            Galeteria <span className="text-brand-olive">Caxias</span>
          </div>
          <div className="flex gap-8 text-sm text-brand-ink/50 font-medium">
            <span className="hover:text-brand-olive cursor-pointer transition-colors">Política de Privacidade</span>
            <span className="hover:text-brand-olive cursor-pointer transition-colors">Trabalhe Conosco</span>
            <span className="hover:text-brand-olive cursor-pointer transition-colors">© 2024 Galeteria Caxias</span>
          </div>
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-brand-cream flex items-center justify-center hover:bg-brand-olive hover:text-white transition-all cursor-pointer">
              <Instagram size={18} />
            </div>
             <div className="w-10 h-10 rounded-full bg-brand-cream flex items-center justify-center hover:bg-brand-olive hover:text-white transition-all cursor-pointer">
              <Phone size={18} />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
