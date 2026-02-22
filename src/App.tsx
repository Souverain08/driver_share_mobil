import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Car as CarIcon, 
  User as UserIcon, 
  Calendar, 
  MapPin, 
  ChevronRight, 
  Star, 
  Plus, 
  LayoutDashboard, 
  LogOut,
  ArrowLeft,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  CreditCard,
  Settings
} from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { mockService } from './services/mockService';
import { User, Car, Booking, Review, CarType } from './types';
import { Button } from './components/Button';
import { Input } from './components/Input';
import { cn } from './lib/utils';

// --- Types for Navigation ---
type Screen = 'login' | 'register' | 'home' | 'search' | 'carDetail' | 'booking' | 'profile' | 'ownerDashboard' | 'addCar' | 'ownerBookings' | 'settings' | 'paymentMethods' | 'helpSupport';

// --- Main App Component ---
export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [user, setUser] = useState<User | null>(null);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [searchResults, setSearchResults] = useState<Car[]>([]);
  const [searchParams, setSearchParams] = useState({ city: '', startDate: '', endDate: '', category: '' });
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Navigation Helper
  const navigate = (screen: Screen, params?: any) => {
    if (screen === 'carDetail') setSelectedCar(params);
    setCurrentScreen(screen);
  };

  // Auth check
  useEffect(() => {
    const loggedUser = mockService.getCurrentUser();
    if (loggedUser) setUser(loggedUser);
  }, []);

  const handleLogout = () => {
    mockService.logout();
    setUser(null);
    navigate('home');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'login': return <LoginScreen onLogin={(u) => { setUser(u); navigate('home'); }} onSwitch={() => navigate('register')} />;
      case 'register': return <RegisterScreen onRegister={(u) => { setUser(u); navigate('home'); }} onSwitch={() => navigate('login')} />;
      case 'home': return <HomeScreen user={user} navigate={navigate} setSearchResults={setSearchResults} setSearchParams={setSearchParams} />;
      case 'search': return <SearchScreen results={searchResults} params={searchParams} navigate={navigate} />;
      case 'carDetail': return <CarDetailScreen car={selectedCar!} user={user} navigate={navigate} />;
      case 'booking': return <BookingScreen car={selectedCar!} user={user} navigate={navigate} />;
      case 'profile': return <ProfileScreen user={user!} navigate={navigate} onLogoutRequest={() => setShowLogoutModal(true)} />;
      case 'settings': return <SettingsScreen user={user!} navigate={navigate} />;
      case 'paymentMethods': return <PaymentMethodsScreen user={user!} navigate={navigate} />;
      case 'helpSupport': return <HelpSupportScreen navigate={navigate} />;
      case 'ownerDashboard': return <OwnerDashboardScreen user={user!} navigate={navigate} />;
      case 'addCar': return <AddCarScreen user={user!} navigate={navigate} />;
      case 'ownerBookings': return <OwnerBookingsScreen user={user!} navigate={navigate} />;
      default: return <HomeScreen user={user} navigate={navigate} setSearchResults={setSearchResults} setSearchParams={setSearchParams} />;
    }
  };

  return (
    <div className="flex justify-center bg-zinc-50 min-h-screen">
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl relative flex flex-col overflow-hidden font-sans">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex-1 overflow-y-auto pb-24"
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>

        {/* Logout Modal */}
        <Modal 
          isOpen={showLogoutModal} 
          onClose={() => setShowLogoutModal(false)}
          title="Déconnexion"
          description="Êtes-vous sûr de vouloir vous déconnecter ?"
          footer={
            <div className="flex gap-3 w-full">
              <Button variant="secondary" className="flex-1" onClick={() => setShowLogoutModal(false)}>Annuler</Button>
              <Button variant="danger" className="flex-1" onClick={() => { setShowLogoutModal(false); handleLogout(); }}>Déconnecter</Button>
            </div>
          }
        />

        {/* Bottom Navigation */}
        {['home', 'search', 'profile', 'ownerDashboard', 'ownerBookings'].includes(currentScreen) && (
          <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-zinc-100 px-6 py-4 flex justify-between items-center z-50">
            <NavButton active={currentScreen === 'home'} icon={<Search size={24} />} label="Explorer" onClick={() => navigate('home')} />
            {user?.role === 'owner' ? (
              <>
                <NavButton active={currentScreen === 'ownerDashboard'} icon={<CarIcon size={24} />} label="Mes Voitures" onClick={() => navigate('ownerDashboard')} />
                <NavButton active={currentScreen === 'ownerBookings'} icon={<LayoutDashboard size={24} />} label="Revenus" onClick={() => navigate('ownerBookings')} />
              </>
            ) : (
              <NavButton active={currentScreen === 'search'} icon={<CarIcon size={24} />} label="Voitures" onClick={() => {
                setSearchResults(mockService.getCars());
                navigate('search');
              }} />
            )}
            <NavButton active={currentScreen === 'profile'} icon={<UserIcon size={24} />} label="Profil" onClick={() => user ? navigate('profile') : navigate('login')} />
          </div>
        )}
      </div>
    </div>
  );
}

// --- Sub-components ---

const NavButton = ({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) => (
  <button onClick={onClick} className={cn("flex flex-col items-center gap-1 transition-colors", active ? "text-black" : "text-zinc-400 hover:text-zinc-600")}>
    {icon}
    <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
  </button>
);

const ScreenHeader = ({ title, onBack, rightElement }: { title: string; onBack?: () => void; rightElement?: React.ReactNode }) => (
  <div className="flex items-center justify-between px-6 py-6 border-b border-zinc-100 sticky top-0 bg-white z-10">
    <div className="flex items-center gap-4">
      {onBack && <button onClick={onBack} className="p-2 -ml-2 hover:bg-zinc-100 rounded-full transition-colors"><ArrowLeft size={20} /></button>}
      <h1 className="text-xl font-bold tracking-tight">{title}</h1>
    </div>
    {rightElement}
  </div>
);

const Modal = ({ isOpen, onClose, title, description, footer }: { isOpen: boolean; onClose: () => void; title: string; description: string; footer: React.ReactNode }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="absolute inset-0 z-[100] flex items-end justify-center px-4 pb-10">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
        />
        <motion.div 
          initial={{ y: 100, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          exit={{ y: 100, opacity: 0 }}
          className="bg-white w-full max-w-sm rounded-[32px] p-8 relative z-10 shadow-2xl"
        >
          <h3 className="text-xl font-bold mb-2">{title}</h3>
          <p className="text-zinc-500 mb-8">{description}</p>
          {footer}
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

// --- Screens ---

const LoginScreen = ({ onLogin, onSwitch }: { onLogin: (u: User) => void; onSwitch: () => void }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = mockService.login(email);
    if (user) onLogin(user);
    else setError('Utilisateur non trouvé. Essayez jean@example.com ou marie@example.com');
  };

  return (
    <div className="px-8 py-12 flex flex-col h-full">
      <div className="mb-12">
        <h1 className="text-4xl font-black tracking-tighter mb-2 italic">DRIVESHARE</h1>
        <p className="text-zinc-500">Connectez-vous pour commencer l'aventure.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input 
          label="Email" 
          placeholder="votre@email.com" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          error={error}
        />
        <Button className="w-full" size="lg">Se connecter</Button>
      </form>
      <div className="mt-auto pt-12 text-center">
        <p className="text-zinc-500 text-sm">Pas encore de compte ?</p>
        <button onClick={onSwitch} className="text-black font-bold mt-1">Créer un compte</button>
      </div>
    </div>
  );
};

const RegisterScreen = ({ onRegister, onSwitch }: { onRegister: (u: User) => void; onSwitch: () => void }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'client' | 'owner'>('client');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = mockService.register(name, email, role);
    onRegister(user);
  };

  return (
    <div className="px-8 py-12 flex flex-col h-full">
      <div className="mb-12">
        <h1 className="text-4xl font-black tracking-tighter mb-2 italic">REJOINDRE</h1>
        <p className="text-zinc-500">Créez votre compte en quelques secondes.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input label="Nom complet" placeholder="Jean Dupont" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Email" placeholder="jean@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 ml-1">Je souhaite :</label>
          <div className="grid grid-cols-2 gap-3">
            <button 
              type="button"
              onClick={() => setRole('client')}
              className={cn("py-3 rounded-xl border text-sm font-bold transition-all", role === 'client' ? "bg-black text-white border-black" : "bg-white text-zinc-500 border-zinc-200")}
            >
              Louer
            </button>
            <button 
              type="button"
              onClick={() => setRole('owner')}
              className={cn("py-3 rounded-xl border text-sm font-bold transition-all", role === 'owner' ? "bg-black text-white border-black" : "bg-white text-zinc-500 border-zinc-200")}
            >
              Proposer
            </button>
          </div>
        </div>
        <Button className="w-full" size="lg">S'inscrire</Button>
      </form>
      <div className="mt-auto pt-12 text-center">
        <p className="text-zinc-500 text-sm">Déjà un compte ?</p>
        <button onClick={onSwitch} className="text-black font-bold mt-1">Se connecter</button>
      </div>
    </div>
  );
};

const HomeScreen = ({ user, navigate, setSearchResults, setSearchParams }: any) => {
  const [city, setCity] = useState('');
  const [category, setCategory] = useState<CarType | ''>('');

  const handleSearch = () => {
    const results = mockService.getCars({ city, category: category || undefined });
    setSearchResults(results);
    setSearchParams({ city, category });
    navigate('search');
  };

  const categories: { label: string; value: CarType; icon: any }[] = [
    { label: 'SUV', value: 'SUV', icon: <CarIcon size={20} /> },
    { label: 'Berline', value: 'Berline', icon: <CarIcon size={20} /> },
    { label: 'Citadine', value: 'Citadine', icon: <CarIcon size={20} /> },
    { label: 'Pickup', value: 'Pickup', icon: <CarIcon size={20} /> },
  ];

  return (
    <div className="pb-12">
      <div className="px-6 pt-12 pb-8 bg-black text-white rounded-b-[40px]">
        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="text-zinc-400 text-sm">Bonjour,</p>
            <h2 className="text-2xl font-bold">{user?.name || 'Invité'} 👋</h2>
          </div>
          {user?.avatar && <img src={user.avatar} className="w-12 h-12 rounded-full border-2 border-white/20" />}
        </div>
        
        <div className="space-y-4">
          <Input 
            placeholder="Où allez-vous ?" 
            icon={<MapPin size={18} />} 
            className="bg-white/10 border-white/10 text-white placeholder:text-zinc-500 focus:border-white/30 focus:ring-white/30"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <Button className="w-full bg-white text-black hover:bg-zinc-200" size="lg" onClick={handleSearch}>
            Rechercher
          </Button>
        </div>
      </div>

      <div className="px-6 mt-8">
        <h3 className="text-lg font-bold mb-4">Catégories</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {categories.map((cat) => (
            <button 
              key={cat.value} 
              onClick={() => setCategory(cat.value)}
              className={cn(
                "flex flex-col items-center gap-2 min-w-[80px] p-4 rounded-2xl border transition-all",
                category === cat.value ? "bg-black text-white border-black" : "bg-white text-zinc-600 border-zinc-100"
              )}
            >
              {cat.icon}
              <span className="text-xs font-bold">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Populaires</h3>
          <button className="text-zinc-400 text-sm font-medium" onClick={() => {
            setSearchResults(mockService.getCars());
            navigate('search');
          }}>Voir tout</button>
        </div>
        <div className="space-y-4">
          {mockService.getCars().slice(0, 3).map(car => (
            <CarCard key={car.id} car={car} onClick={() => navigate('carDetail', car)} />
          ))}
        </div>
      </div>
    </div>
  );
};

const CarCard = ({ car, onClick }: { car: Car; onClick: () => void }) => (
  <div onClick={onClick} className="bg-white rounded-3xl border border-zinc-100 overflow-hidden group active:scale-[0.98] transition-all">
    <div className="relative h-48 overflow-hidden">
      <img src={car.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
        {car.type === 'classic' ? 'DriveShare' : 'Particulier'}
      </div>
      <div className="absolute bottom-4 right-4 bg-black text-white px-3 py-1 rounded-full text-sm font-bold">
        {car.pricePerDay}€<span className="text-[10px] font-normal opacity-70">/j</span>
      </div>
    </div>
    <div className="p-5">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-bold text-lg">{car.brand} {car.model}</h4>
          <p className="text-zinc-400 text-sm flex items-center gap-1"><MapPin size={14} /> {car.city}</p>
        </div>
        <div className="flex items-center gap-1 bg-zinc-50 px-2 py-1 rounded-lg">
          <Star size={14} className="fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-bold">4.8</span>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <span className="text-[10px] font-bold bg-zinc-100 text-zinc-600 px-2 py-1 rounded-md uppercase">{car.category}</span>
        <span className="text-[10px] font-bold bg-zinc-100 text-zinc-600 px-2 py-1 rounded-md uppercase">{car.year}</span>
      </div>
    </div>
  </div>
);

const SearchScreen = ({ results, params, navigate }: any) => {
  return (
    <div className="pb-12">
      <ScreenHeader title="Résultats" onBack={() => navigate('home')} />
      <div className="px-6 py-4 bg-zinc-50 flex items-center gap-2">
        <div className="flex-1 text-sm text-zinc-500">
          {results.length} voitures trouvées {params.city && `à ${params.city}`}
        </div>
        <Button variant="ghost" size="sm" className="gap-2"><Filter size={16} /> Filtres</Button>
      </div>
      <div className="px-6 space-y-6 mt-4">
        {results.map((car: Car) => (
          <CarCard key={car.id} car={car} onClick={() => navigate('carDetail', car)} />
        ))}
        {results.length === 0 && (
          <div className="py-20 text-center">
            <div className="bg-zinc-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-zinc-400" />
            </div>
            <p className="text-zinc-500 font-medium">Aucune voiture trouvée.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const CarDetailScreen = ({ car, user, navigate }: { car: Car; user: User | null; navigate: any }) => {
  const reviews = mockService.getCarReviews(car.id);
  
  return (
    <div className="pb-32">
      <div className="relative h-80">
        <img src={car.images[0]} className="w-full h-full object-cover" />
        <button onClick={() => navigate('home')} className="absolute top-6 left-6 bg-white p-2 rounded-full shadow-lg"><ArrowLeft size={20} /></button>
      </div>
      
      <div className="px-6 -mt-8 bg-white rounded-t-[40px] pt-8 relative">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight">{car.brand} {car.model}</h1>
            <p className="text-zinc-400 font-medium">{car.year} • {car.category} • {car.city}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black">{car.pricePerDay}€</p>
            <p className="text-xs text-zinc-400 font-bold uppercase">par jour</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <DetailBadge icon={<Clock size={16} />} label="Automatique" />
          <DetailBadge icon={<CarIcon size={16} />} label="5 Places" />
          <DetailBadge icon={<Star size={16} />} label="4.8 (24)" />
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-bold mb-2">Description</h3>
          <p className="text-zinc-500 leading-relaxed">{car.description}</p>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-bold mb-4">Avis clients</h3>
          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review.id} className="bg-zinc-50 p-4 rounded-2xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-sm">{review.userName}</span>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => <Star key={i} size={12} className={cn(i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-zinc-300")} />)}
                  </div>
                </div>
                <p className="text-xs text-zinc-500">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-zinc-100 flex items-center gap-4 z-50 max-w-md mx-auto">
        <div className="flex-1">
          <p className="text-xs text-zinc-400 font-bold uppercase">Prix total estimé</p>
          <p className="text-xl font-black">{car.pricePerDay * 3}€ <span className="text-xs font-normal text-zinc-400">(3j)</span></p>
        </div>
        <Button size="lg" className="px-10" onClick={() => user ? navigate('booking', car) : navigate('login')}>Réserver</Button>
      </div>
    </div>
  );
};

const DetailBadge = ({ icon, label }: { icon: any; label: string }) => (
  <div className="flex flex-col items-center gap-2 p-3 bg-zinc-50 rounded-2xl border border-zinc-100">
    <div className="text-zinc-400">{icon}</div>
    <span className="text-[10px] font-bold text-zinc-600 uppercase">{label}</span>
  </div>
);

const BookingScreen = ({ car, user, navigate }: { car: Car; user: User | null; navigate: any }) => {
  const [days, setDays] = useState(3);
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePay = () => {
    mockService.createBooking({
      carId: car.id,
      clientId: user!.id,
      ownerId: car.ownerId,
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(new Date(Date.now() + days * 86400000), 'yyyy-MM-dd'),
      totalPrice: car.pricePerDay * days,
    });
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-8 text-center">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={48} />
        </div>
        <h1 className="text-3xl font-black mb-2">Réservation confirmée !</h1>
        <p className="text-zinc-500 mb-12">Votre demande a été envoyée au propriétaire. Vous recevrez une notification bientôt.</p>
        <Button className="w-full" size="lg" onClick={() => navigate('home')}>Retour à l'accueil</Button>
      </div>
    );
  }

  return (
    <div className="pb-12">
      <ScreenHeader title="Réservation" onBack={() => navigate('carDetail', car)} />
      <div className="px-6 py-8">
        <div className="flex gap-4 p-4 bg-zinc-50 rounded-3xl mb-8">
          <img src={car.images[0]} className="w-24 h-24 rounded-2xl object-cover" />
          <div>
            <h3 className="font-bold">{car.brand} {car.model}</h3>
            <p className="text-sm text-zinc-500">{car.city}</p>
            <p className="text-lg font-black mt-2">{car.pricePerDay}€<span className="text-xs font-normal">/j</span></p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold ml-1">Durée de location</label>
            <div className="flex items-center justify-between p-4 border border-zinc-200 rounded-2xl">
              <button onClick={() => setDays(Math.max(1, days - 1))} className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center font-bold">-</button>
              <span className="text-lg font-black">{days} jours</span>
              <button onClick={() => setDays(days + 1)} className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center font-bold">+</button>
            </div>
          </div>

          <div className="p-6 bg-black text-white rounded-3xl space-y-4">
            <div className="flex justify-between text-sm opacity-70">
              <span>Prix par jour</span>
              <span>{car.pricePerDay}€</span>
            </div>
            <div className="flex justify-between text-sm opacity-70">
              <span>Frais de service</span>
              <span>15€</span>
            </div>
            <div className="h-px bg-white/10" />
            <div className="flex justify-between text-xl font-black">
              <span>Total</span>
              <span>{car.pricePerDay * days + 15}€</span>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-bold">Paiement</h3>
            <div className="p-4 border border-zinc-200 rounded-2xl flex items-center gap-4">
              <div className="bg-zinc-100 p-2 rounded-lg"><CreditCard size={20} /></div>
              <div className="flex-1">
                <p className="text-sm font-bold">Visa •••• 4242</p>
                <p className="text-xs text-zinc-400">Expire 12/26</p>
              </div>
              <ChevronRight size={20} className="text-zinc-300" />
            </div>
          </div>
        </div>
      </div>
      <div className="px-6 mt-8">
        <Button className="w-full" size="lg" onClick={handlePay}>Payer et Réserver</Button>
      </div>
    </div>
  );
};

const ProfileScreen = ({ user, navigate, onLogoutRequest }: any) => {
  const bookings = mockService.getUserBookings(user.id);

  return (
    <div className="pb-12 bg-zinc-50 min-h-full">
      <div className="bg-white px-6 pt-12 pb-8 rounded-b-[40px] shadow-sm border-b border-zinc-100">
        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            <img src={user.avatar} className="w-28 h-28 rounded-full border-4 border-zinc-50 shadow-md object-cover" />
            <div className="absolute bottom-0 right-0 bg-black text-white p-2 rounded-full border-4 border-white">
              <Plus size={16} />
            </div>
          </div>
          <h2 className="text-2xl font-black tracking-tight">{user.name}</h2>
          <p className="text-zinc-400 font-medium mb-4">{user.email}</p>
          
          <div className="flex gap-3">
            <div className="bg-zinc-100 px-4 py-2 rounded-2xl flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-widest text-zinc-500">
                {user.role === 'owner' ? 'Propriétaire' : 'Client'}
              </span>
            </div>
            <div className="bg-green-50 px-4 py-2 rounded-2xl flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-widest text-green-600">
                Vérifié
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold">Mes Réservations</h3>
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{bookings.length} au total</span>
        </div>
        
        <div className="space-y-4">
          {bookings.slice(0, 2).map(booking => {
            const car = mockService.getCarById(booking.carId);
            return (
              <div key={booking.id} className="p-4 bg-white border border-zinc-100 rounded-3xl flex gap-4 items-center shadow-sm">
                <img src={car?.images[0]} className="w-16 h-16 rounded-2xl object-cover" />
                <div className="flex-1">
                  <h4 className="font-bold text-sm">{car?.brand} {car?.model}</h4>
                  <p className="text-[10px] text-zinc-400 font-medium">{booking.startDate} au {booking.endDate}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className={cn(
                      "text-[8px] font-black uppercase px-2 py-0.5 rounded-full",
                      booking.status === 'confirmed' ? "bg-green-100 text-green-600" : 
                      booking.status === 'pending' ? "bg-yellow-100 text-yellow-600" : "bg-zinc-100 text-zinc-400"
                    )}>
                      {booking.status}
                    </span>
                    <span className="text-xs font-black">{booking.totalPrice}€</span>
                  </div>
                </div>
              </div>
            );
          })}
          {bookings.length > 2 && (
            <button className="w-full py-3 text-zinc-400 text-xs font-bold uppercase tracking-widest hover:text-black transition-colors">
              Voir tout l'historique
            </button>
          )}
          {bookings.length === 0 && (
            <div className="bg-white p-8 rounded-3xl border border-dashed border-zinc-200 text-center">
              <p className="text-zinc-400 text-sm">Aucune réservation pour le moment.</p>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 space-y-3">
        <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-2 mb-1">Compte</h3>
        <div className="bg-white rounded-[32px] border border-zinc-100 overflow-hidden shadow-sm">
          <ProfileLink icon={<Settings size={18} />} label="Paramètres du compte" onClick={() => navigate('settings')} />
          <div className="h-px bg-zinc-50 mx-6" />
          <ProfileLink icon={<CreditCard size={18} />} label="Modes de paiement" onClick={() => navigate('paymentMethods')} />
          <div className="h-px bg-zinc-50 mx-6" />
          <ProfileLink icon={<Star size={18} />} label="Aide & Support" onClick={() => navigate('helpSupport')} />
        </div>

        <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-2 mt-6 mb-1">Session</h3>
        <button 
          onClick={onLogoutRequest}
          className="w-full flex items-center gap-4 p-5 bg-red-50 text-red-600 rounded-[32px] hover:bg-red-100 transition-colors"
        >
          <LogOut size={18} />
          <span className="text-sm font-bold">Se déconnecter</span>
        </button>
      </div>
    </div>
  );
};

const ProfileLink = ({ icon, label, onClick }: { icon: any; label: string; onClick: () => void }) => (
  <button onClick={onClick} className="w-full flex items-center justify-between p-5 hover:bg-zinc-50 transition-colors">
    <div className="flex items-center gap-4 text-zinc-600">
      <div className="bg-zinc-50 p-2 rounded-xl text-zinc-400">
        {icon}
      </div>
      <span className="text-sm font-bold">{label}</span>
    </div>
    <ChevronRight size={18} className="text-zinc-300" />
  </button>
);

const SettingsScreen = ({ user, navigate }: any) => (
  <div className="pb-12 bg-white min-h-full">
    <ScreenHeader title="Paramètres" onBack={() => navigate('profile')} />
    <div className="px-6 py-8 space-y-8">
      <div className="space-y-4">
        <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Informations personnelles</h3>
        <Input label="Nom complet" defaultValue={user.name} />
        <Input label="Email" defaultValue={user.email} />
        <Input label="Téléphone" placeholder="+33 6 00 00 00 00" />
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Sécurité</h3>
        <Button variant="outline" className="w-full justify-start gap-3">Modifier le mot de passe</Button>
        <Button variant="outline" className="w-full justify-start gap-3">Double authentification</Button>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Notifications</h3>
        <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl">
          <span className="text-sm font-bold">Notifications Push</span>
          <div className="w-12 h-6 bg-black rounded-full relative">
            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
          </div>
        </div>
        <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl">
          <span className="text-sm font-bold">Emails marketing</span>
          <div className="w-12 h-6 bg-zinc-200 rounded-full relative">
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full" />
          </div>
        </div>
      </div>

      <Button className="w-full mt-8" size="lg">Enregistrer les modifications</Button>
    </div>
  </div>
);

const PaymentMethodsScreen = ({ user, navigate }: any) => (
  <div className="pb-12 bg-white min-h-full">
    <ScreenHeader title="Modes de paiement" onBack={() => navigate('profile')} />
    <div className="px-6 py-8 space-y-6">
      <div className="p-6 bg-zinc-900 text-white rounded-[32px] relative overflow-hidden shadow-xl">
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-12">
            <CreditCard size={32} />
            <span className="text-xs font-black uppercase tracking-widest opacity-50 italic">VISA</span>
          </div>
          <p className="text-xl font-mono tracking-[0.2em] mb-4">•••• •••• •••• 4242</p>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest opacity-50 mb-1">Titulaire</p>
              <p className="text-sm font-bold uppercase">{user.name}</p>
            </div>
            <div className="text-right">
              <p className="text-[8px] font-black uppercase tracking-widest opacity-50 mb-1">Expire</p>
              <p className="text-sm font-bold">12/26</p>
            </div>
          </div>
        </div>
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full" />
        <div className="absolute -left-10 -bottom-10 w-60 h-60 bg-white/5 rounded-full" />
      </div>

      <Button variant="outline" className="w-full py-6 border-dashed border-2 gap-3">
        <Plus size={20} />
        Ajouter une carte
      </Button>

      <div className="pt-8 space-y-4">
        <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Autres options</h3>
        <div className="flex items-center justify-between p-5 bg-zinc-50 rounded-[24px]">
          <div className="flex items-center gap-4">
            <div className="bg-white p-2 rounded-xl shadow-sm">
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold">PayPal</span>
          </div>
          <span className="text-xs font-bold text-zinc-400">Non lié</span>
        </div>
      </div>
    </div>
  </div>
);

const HelpSupportScreen = ({ navigate }: any) => (
  <div className="pb-12 bg-white min-h-full">
    <ScreenHeader title="Aide & Support" onBack={() => navigate('profile')} />
    <div className="px-6 py-8 space-y-8">
      <div className="bg-black text-white p-8 rounded-[40px] text-center">
        <h3 className="text-xl font-bold mb-2">Comment pouvons-nous vous aider ?</h3>
        <p className="text-zinc-400 text-sm mb-6">Notre équipe est disponible 24/7 pour vous accompagner.</p>
        <Button className="bg-white text-black hover:bg-zinc-200">Contacter le support</Button>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">FAQ Populaires</h3>
        <FAQItem question="Comment annuler une réservation ?" />
        <FAQItem question="Quelles sont les conditions d'assurance ?" />
        <FAQItem question="Comment ajouter ma voiture ?" />
        <FAQItem question="Politique de remboursement" />
      </div>

      <div className="pt-4 grid grid-cols-2 gap-4">
        <div className="p-6 bg-zinc-50 rounded-[32px] text-center">
          <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
            <Clock size={20} className="text-zinc-400" />
          </div>
          <p className="text-xs font-bold">Centre d'aide</p>
        </div>
        <div className="p-6 bg-zinc-50 rounded-[32px] text-center">
          <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
            <Star size={20} className="text-zinc-400" />
          </div>
          <p className="text-xs font-bold">Laisser un avis</p>
        </div>
      </div>
    </div>
  </div>
);

const FAQItem = ({ question }: { question: string }) => (
  <div className="flex items-center justify-between p-5 bg-zinc-50 rounded-[24px] hover:bg-zinc-100 transition-colors cursor-pointer">
    <span className="text-sm font-bold">{question}</span>
    <ChevronRight size={18} className="text-zinc-300" />
  </div>
);

const OwnerDashboardScreen = ({ user, navigate }: any) => {
  const cars = mockService.getOwnerCars(user.id);

  return (
    <div className="pb-12">
      <ScreenHeader title="Mes Voitures" rightElement={<Button size="icon" variant="primary" onClick={() => navigate('addCar')}><Plus size={20} /></Button>} />
      
      <div className="px-6 py-6 grid grid-cols-2 gap-4">
        <StatCard label="Revenus" value="1,240€" color="bg-green-50 text-green-600" />
        <StatCard label="Voitures" value={cars.length.toString()} color="bg-blue-50 text-blue-600" />
      </div>

      <div className="px-6 mt-4 space-y-6">
        {cars.map(car => (
          <div key={car.id} className="bg-white border border-zinc-100 rounded-3xl overflow-hidden">
            <div className="relative h-32">
              <img src={car.images[0]} className="w-full h-full object-cover" />
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-bold">
                {car.available ? 'Disponible' : 'Occupée'}
              </div>
            </div>
            <div className="p-4 flex justify-between items-center">
              <div>
                <h4 className="font-bold">{car.brand} {car.model}</h4>
                <p className="text-xs text-zinc-400">{car.pricePerDay}€ / jour</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Modifier</Button>
              </div>
            </div>
          </div>
        ))}
        {cars.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-zinc-400">Vous n'avez pas encore ajouté de voiture.</p>
            <Button className="mt-4" onClick={() => navigate('addCar')}>Ajouter ma première voiture</Button>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <div className={cn("p-6 rounded-[32px] flex flex-col gap-1", color)}>
    <span className="text-[10px] font-black uppercase tracking-widest opacity-70">{label}</span>
    <span className="text-2xl font-black">{value}</span>
  </div>
);

const OwnerBookingsScreen = ({ user, navigate }: any) => {
  const bookings = mockService.getOwnerBookings(user.id);

  const handleStatus = (id: string, status: Booking['status']) => {
    mockService.updateBookingStatus(id, status);
    navigate('ownerBookings'); // Refresh
  };

  return (
    <div className="pb-12">
      <ScreenHeader title="Réservations Reçues" />
      <div className="px-6 py-6 space-y-4">
        {bookings.map(booking => {
          const car = mockService.getCarById(booking.carId);
          return (
            <div key={booking.id} className="p-5 border border-zinc-100 rounded-3xl space-y-4">
              <div className="flex gap-4">
                <img src={car?.images[0]} className="w-16 h-16 rounded-2xl object-cover" />
                <div className="flex-1">
                  <h4 className="font-bold">{car?.brand} {car?.model}</h4>
                  <p className="text-xs text-zinc-400">Client ID: {booking.clientId}</p>
                  <p className="text-xs font-bold mt-1">{booking.totalPrice}€ • {booking.status}</p>
                </div>
              </div>
              {booking.status === 'pending' && (
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" size="sm" className="text-red-500 border-red-100 hover:bg-red-50" onClick={() => handleStatus(booking.id, 'rejected')}>Refuser</Button>
                  <Button variant="primary" size="sm" onClick={() => handleStatus(booking.id, 'confirmed')}>Accepter</Button>
                </div>
              )}
            </div>
          );
        })}
        {bookings.length === 0 && <p className="text-center text-zinc-400 py-20">Aucune demande reçue.</p>}
      </div>
    </div>
  );
};

const AddCarScreen = ({ user, navigate }: any) => {
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: 2024,
    pricePerDay: 50,
    city: '',
    category: 'Berline' as CarType,
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mockService.addCar({
      ...formData,
      ownerId: user.id,
      type: 'marketplace',
      images: ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800'],
    });
    navigate('ownerDashboard');
  };

  return (
    <div className="pb-12">
      <ScreenHeader title="Ajouter une voiture" onBack={() => navigate('ownerDashboard')} />
      <form onSubmit={handleSubmit} className="px-6 py-8 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Marque" placeholder="Tesla" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
          <Input label="Modèle" placeholder="Model 3" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Année" type="number" value={formData.year} onChange={e => setFormData({...formData, year: parseInt(e.target.value)})} />
          <Input label="Prix / jour (€)" type="number" value={formData.pricePerDay} onChange={e => setFormData({...formData, pricePerDay: parseInt(e.target.value)})} />
        </div>
        <Input label="Ville" placeholder="Paris" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 ml-1">Catégorie</label>
          <select 
            className="w-full rounded-xl border border-zinc-200 bg-white py-3 px-4 outline-none focus:border-black"
            value={formData.category}
            onChange={e => setFormData({...formData, category: e.target.value as CarType})}
          >
            <option>SUV</option>
            <option>Berline</option>
            <option>Citadine</option>
            <option>Pickup</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 ml-1">Description</label>
          <textarea 
            className="w-full rounded-xl border border-zinc-200 bg-white py-3 px-4 outline-none focus:border-black min-h-[100px]"
            placeholder="Décrivez votre voiture..."
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
        </div>
        <Button className="w-full" size="lg">Publier l'annonce</Button>
      </form>
    </div>
  );
};
