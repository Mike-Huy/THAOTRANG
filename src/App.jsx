import { BrowserRouter as Router, Routes, Route, useLocation, Link, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatButtons from './components/FloatButtons';
import Home from './pages/Home';
import About from './pages/About';
import Products from './pages/Products';
import Booking from './pages/Booking';
import Activities from './pages/Activities';
import News from './pages/News';
import Contact from './pages/Contact';

// Admin Imports
import AdminLayout from './components/admin/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import Users from './pages/admin/Users';
import Posts from './pages/admin/Posts';
import AdminProducts from './pages/admin/Products';
import AdminBookings from './pages/admin/Bookings';
import AdminActivities from './pages/admin/Activities';
import Contacts from './pages/admin/Contacts';
import Settings from './pages/admin/Settings';

// import './styles/index.css';

function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 pt-12">
      <div className="text-8xl font-black text-gray-100 mb-4">404</div>
      <h1 className="text-xl font-black text-gray-700 uppercase tracking-widest mb-2">Trang không tìm thấy</h1>
      <p className="text-gray-400 text-sm mb-8">Đường dẫn này không tồn tại hoặc đã bị xóa.</p>
      <Link to="/" className="btn-primary">Về trang chủ</Link>
    </div>
  );
}

function AppContent() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <div className="app-container">
      {!isAdminPath && <Navbar />}
      <main>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/gioi-thieu" element={<About />} />
          <Route path="/san-pham" element={<Products />} />
          <Route path="/dat-san" element={<Booking />} />
          <Route path="/hoat-dong" element={<Activities />} />
          <Route path="/tin-tuc" element={<News />} />
          <Route path="/tin-tuc/:slug" element={<Navigate to="/tin-tuc" replace />} />
          <Route path="/lien-he" element={<Contact />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="posts" element={<Posts />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="activities" element={<AdminActivities />} />
              <Route path="about" element={<Settings initialTab="about" />} />
              <Route path="contacts" element={<Contacts />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>

          {/* 404 catch-all — phải đặt cuối cùng */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isAdminPath && <Footer />}
      {!isAdminPath && <FloatButtons />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
