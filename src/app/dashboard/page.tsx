'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { getInventario, getGastos, InventarioItem, GastoItem } from '@/lib/sheets';
import {
    Baby,
    Milk,
    TrendingUp,
    ShoppingCart,
    LogOut,
    ChevronRight,
    PawPrint,
    Dog,
    RefreshCw,
    Menu,
    X
} from 'lucide-react';

// Custom Animal Icons for a premium look
const CowIcon = ({ size = 28 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 11c0-3 1.5-5 5-5s5 2 5 5v4c0 3-2 5-5 5s-5-2-5-5v-4z" /> {/* Face */}
        <path d="M7 5c-1-1-2.5-1-3.5 0S3 7.5 4 8.5L7 11" /> {/* Ear L */}
        <path d="M17 5c1-1 2.5-1 3.5 0s.5 2.5-.5 3.5L17 11" /> {/* Ear R */}
        <path d="M9 16h6" /> {/* Mouth */}
        <circle cx="9" cy="11" r="0.5" fill="currentColor" />
        <circle cx="15" cy="11" r="0.5" fill="currentColor" />
    </svg>
);

const BullIcon = ({ size = 28 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 11c0-3 1.5-5 5-5s5 2 5 5v4c0 3-2 5-5 5s-5-2-5-5v-4z" />
        <path d="M5 7c-2-2-4-2-4 2s2 2 4 2" /> {/* Horn L */}
        <path d="M19 7c2-2 4-2 4 2s-2 2-4 2" /> {/* Horn R */}
        <circle cx="9" cy="11" r="0.5" fill="currentColor" />
        <circle cx="15" cy="11" r="0.5" fill="currentColor" />
    </svg>
);

const HorseIcon = ({ size = 28 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 3l3 2 1 4-2 5h-4l-1-4z" /> {/* Face profile-ish */}
        <path d="M11 5c1-1 2 0 2 2v3" /> {/* Short mane */}
        <path d="M8 20c0-5 2-8 6-8h4" />
        <circle cx="10" cy="8" r="0.5" fill="currentColor" />
    </svg>
);

const MareIcon = ({ size = 28 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 3l3 2 1 4-2 5h-4l-1-4z" />
        <path d="M11 5c1-2 4-1 4 4s-1 6-1 8" /> {/* Long decorative mane */}
        <path d="M8 20c0-5 2-8 6-8h4" />
        <circle cx="10" cy="8" r="0.5" fill="currentColor" />
    </svg>
);

const MuleIcon = ({ size = 28 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 3l3 2 1 4-2 5h-4l-1-4z" />
        <path d="M11 5c.5-2 2-2 3 0s1 4 1 6" /> {/* Long ears characteristic of mules */}
        <path d="M8 20c0-5 2-8 6-8h4" />
        <circle cx="10" cy="8" r="0.5" fill="currentColor" />
    </svg>
);
import AIChat from '@/components/AIChat';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie,
    Legend
} from 'recharts';

export default function DashboardPage() {
    const [session, setSession] = useState<any>(null);
    const [inventario, setInventario] = useState<InventarioItem[]>([]);
    const [gastos, setGastos] = useState<GastoItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [activeTab, setActiveTab] = useState('dashboard');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [filterMonth, setFilterMonth] = useState<number>(new Date().getMonth() + 1);
    const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());
    const router = useRouter();

    const fetchData = async (isManual = false) => {
        if (isManual) setRefreshing(true);
        try {
            const [invData, gasData] = await Promise.all([
                getInventario(),
                getGastos()
            ]);
            setInventario(invData);
            setGastos(gasData);
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
            } else {
                setSession(session);
                fetchData();
            }
        };

        checkSession();

        // Auto-refresh every 60 seconds
        const interval = setInterval(() => {
            fetchData();
        }, 60000);

        return () => clearInterval(interval);
    }, [router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
                <p>Cargando datos de la finca...</p>
            </div>
        );
    }

    // Process data for charts
    const expenseSummary = gastos.map(g => ({
        name: g.Producto,
        value: parseFloat(g.Total.replace(/[^0-9.-]+/g, "")) || 0
    })).slice(0, 5); // Just top 5 for demo

    const COLORS = ['#3E2723', '#5D4037', '#8D6E63', '#A1887F', '#D7CCC8'];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-background)', position: 'relative' }}>
            {/* Sidebar Mobile Overlay */}
            {mobileMenuOpen && (
                <div
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        zIndex: 99,
                        backdropFilter: 'blur(2px)'
                    }}
                />
            )}

            {/* Sidebar */}
            <aside style={{
                width: '280px',
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                padding: '2rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                height: '100vh',
                zIndex: 100,
                transition: 'transform 0.3s ease',
                transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
                left: 0,
                // Desktop override
                ...(window?.innerWidth > 768 ? { position: 'static', transform: 'none' } : {})
            }}>
                {/* Wrap in actual media query logic via useEffect for real-time resizes if needed, 
                    but for now using a standard responsive approach */}
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @media (min-width: 769px) {
                        aside { transform: none !important; position: static !important; }
                        .mobile-nav-toggle { display: none !important; }
                    }
                    @media (max-width: 768px) {
                        main { padding: 1.5rem !important; }
                        .header-controls { flex-direction: column; align-items: flex-end !important; }
                    }
                `}} />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--color-accent)' }}>
                            <img src="/logo-la-milagrosa.jpg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <h2 style={{ fontSize: '1.2rem', color: 'white' }}>La Milagrosa</h2>
                    </div>
                    <button
                        className="mobile-only"
                        onClick={() => setMobileMenuOpen(false)}
                        style={{ background: 'none', border: 'none', color: 'white' }}
                    >
                        <X size={24} />
                    </button>
                </div>

                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div
                        onClick={() => setActiveTab('dashboard')}
                        style={{
                            padding: '0.8rem',
                            borderRadius: 'var(--radius-premium)',
                            backgroundColor: activeTab === 'dashboard' ? 'var(--color-secondary)' : 'transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            color: activeTab === 'dashboard' ? 'white' : 'rgba(255,255,255,0.7)'
                        }}
                    >
                        <TrendingUp size={20} /> Dashboard
                    </div>
                    <div
                        onClick={() => setActiveTab('inventario')}
                        style={{
                            padding: '0.8rem',
                            borderRadius: 'var(--radius-premium)',
                            backgroundColor: activeTab === 'inventario' ? 'var(--color-secondary)' : 'transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            color: activeTab === 'inventario' ? 'white' : 'rgba(255,255,255,0.7)'
                        }}
                    >
                        <CowIcon size={20} /> Inventario
                    </div>
                    <div
                        onClick={() => setActiveTab('gastos')}
                        style={{
                            padding: '0.8rem',
                            borderRadius: 'var(--radius-premium)',
                            backgroundColor: activeTab === 'gastos' ? 'var(--color-secondary)' : 'transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            color: activeTab === 'gastos' ? 'white' : 'rgba(255,255,255,0.7)'
                        }}
                    >
                        <ShoppingCart size={20} /> Gastos
                    </div>
                </nav>

                <button onClick={handleLogout} style={{
                    marginTop: 'auto',
                    background: 'none',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: 'white',
                    padding: '0.8rem',
                    borderRadius: 'var(--radius-premium)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                }}>
                    <LogOut size={18} /> Salir
                </button>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '2rem 3rem', overflowY: 'auto', width: '100%' }}>
                <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <button
                            className="mobile-nav-toggle"
                            onClick={() => setMobileMenuOpen(true)}
                            style={{ background: 'var(--color-primary)', border: 'none', color: 'white', padding: '0.5rem', borderRadius: '8px' }}
                        >
                            <Menu size={24} />
                        </button>
                        <div>
                            <h1 style={{ fontSize: '1.8rem' }}>Panel de Control</h1>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Resumen general de la finca hoy.</p>
                        </div>
                    </div>
                    <div className="header-controls" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ textAlign: 'right', marginRight: '1rem' }}>
                            <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', margin: 0 }}>Actualizado: {lastUpdated.toLocaleTimeString()}</p>
                            <button
                                onClick={() => fetchData(true)}
                                disabled={refreshing}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--color-primary)',
                                    fontSize: '0.85rem',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    padding: '4px 8px',
                                    borderRadius: '4px'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(62, 39, 35, 0.05)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <RefreshCw size={14} className={refreshing ? 'spin-animation' : ''} />
                                {refreshing ? 'Sincronizando...' : 'Actualizar ahora'}
                            </button>
                        </div>
                        <div style={{ backgroundColor: 'white', padding: '0.5rem 1.5rem', borderRadius: '30px', border: '1px solid var(--color-border)', fontSize: '0.9rem' }}>
                            {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                    </div>
                </header>

                {/* Dynamic Content based on Active Tab */}
                {activeTab === 'dashboard' && (
                    <>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: '1.5rem',
                            marginBottom: '3rem'
                        }}>
                            {inventario.map((item, idx) => (
                                <div key={idx} className="premium-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>{item.Especie}</p>
                                        <h2 style={{ fontSize: '2rem' }}>{item['Cantidad total']}</h2>
                                        {item['Cantidad embarazadas'] !== '0' && (
                                            <span style={{ fontSize: '0.8rem', color: '#8B4513', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Baby size={12} /> {item['Cantidad embarazadas']} Embarazadas
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ backgroundColor: 'var(--color-background)', padding: '1rem', borderRadius: '12px', color: 'var(--color-primary)' }}>
                                        {item.Especie === 'Vacas' ? <CowIcon size={28} /> :
                                            item.Especie === 'Toros' ? <BullIcon size={28} /> :
                                                item.Especie === 'Caballos' ? <HorseIcon size={28} /> :
                                                    item.Especie === 'Yeguas' ? <MareIcon size={28} /> :
                                                        item.Especie === 'Perros' ? <Dog size={28} /> :
                                                            item.Especie === 'Perras' ? <PawPrint size={28} /> :
                                                                item.Especie === 'Mulas' ? <MuleIcon size={28} /> :
                                                                    <PawPrint size={28} />}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                            gap: '2rem'
                        }}>
                            <div className="premium-card" style={{ height: '400px' }}>
                                <h3 style={{ marginBottom: '1.5rem' }}>Análisis de Gastos</h3>
                                <ResponsiveContainer width="100%" height="85%">
                                    <BarChart data={expenseSummary}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            itemStyle={{ color: 'var(--color-primary)', fontWeight: 'bold' }}
                                        />
                                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                            {expenseSummary.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="premium-card" style={{ height: '400px' }}>
                                <h3 style={{ marginBottom: '1.5rem' }}>Distribución Población</h3>
                                <ResponsiveContainer width="100%" height="85%">
                                    <PieChart>
                                        <Pie
                                            data={inventario
                                                .map(i => {
                                                    const clean = i['Cantidad total'].replace(/[^0-9,.]/g, '');
                                                    const lastComma = clean.lastIndexOf(',');
                                                    const lastDot = clean.lastIndexOf('.');
                                                    let val = 0;
                                                    if (lastComma > lastDot) val = parseInt(clean.replace(/\./g, '')) || 0;
                                                    else if (lastDot > lastComma) val = parseInt(clean.replace(/,/g, ''));
                                                    else val = parseInt(clean.replace(',', '').replace('.', ''));
                                                    return { name: i.Especie, value: val };
                                                })
                                                .filter(i => i.value > 0)
                                            }
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {inventario.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="premium-card">
                                <h3 style={{ marginBottom: '1.5rem' }}>Gastos Recientes</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {gastos.slice(0, 5).map((g, idx) => (
                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: idx < 4 ? '1px solid var(--color-border)' : 'none' }}>
                                            <div>
                                                <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>{g.Producto}</p>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{g['Fecha compra']}</p>
                                            </div>
                                            <p style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>{g.Total}</p>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setActiveTab('gastos')}
                                    style={{ width: '100%', marginTop: '1.5rem', background: 'none', border: 'none', color: 'var(--color-secondary)', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    Ver todos <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'inventario' && (
                    <div className="premium-card">
                        <h2 style={{ marginBottom: '2rem' }}>Inventario Completo</h2>
                        <div className="scroll-x-auto">
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--color-border)' }}>
                                        <th style={{ padding: '1rem' }}>Especie</th>
                                        <th style={{ padding: '1rem' }}>Embarazadas</th>
                                        <th style={{ padding: '1rem' }}>Sin Embarazo</th>
                                        <th style={{ padding: '1rem' }}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inventario.map((item, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid var(--color-background)' }}>
                                            <td style={{ padding: '1rem', fontWeight: '600' }}>{item.Especie}</td>
                                            <td style={{ padding: '1rem' }}>{item['Cantidad embarazadas']}</td>
                                            <td style={{ padding: '1rem' }}>{item['Cantidad sin embarazo']}</td>
                                            <td style={{ padding: '1rem', fontWeight: 'bold' }}>{item['Cantidad total']}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'gastos' && (
                    <div className="premium-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <h2>Registro de Gastos</h2>
                                <select
                                    value={filterMonth}
                                    onChange={(e) => setFilterMonth(parseInt(e.target.value))}
                                    style={{ padding: '0.4rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                                >
                                    <option value={0}>Todos los meses</option>
                                    <option value={1}>Enero</option>
                                    <option value={2}>Febrero</option>
                                    <option value={3}>Marzo</option>
                                    <option value={4}>Abril</option>
                                    <option value={5}>Mayo</option>
                                    <option value={6}>Junio</option>
                                    <option value={7}>Julio</option>
                                    <option value={8}>Agosto</option>
                                    <option value={9}>Septiembre</option>
                                    <option value={10}>Octubre</option>
                                    <option value={11}>Noviembre</option>
                                    <option value={12}>Diciembre</option>
                                </select>
                                <select
                                    value={filterYear}
                                    onChange={(e) => setFilterYear(parseInt(e.target.value))}
                                    style={{ padding: '0.4rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                                >
                                    <option value={0}>Todos los años</option>
                                    <option value={2024}>2024</option>
                                    <option value={2025}>2025</option>
                                    <option value={2026}>2026</option>
                                </select>
                            </div>
                            <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--color-primary)' }}>
                                Total: {gastos
                                    .filter(g => {
                                        const [d, m, y] = g['Fecha compra'].split('/').map(n => parseInt(n));
                                        if (filterMonth !== 0 && m !== filterMonth) return false;
                                        if (filterYear !== 0 && y !== filterYear) return false;
                                        return true;
                                    })
                                    .reduce((acc, curr) => {
                                        const clean = curr.Total.replace(/[^0-9,.]/g, '');
                                        const lastComma = clean.lastIndexOf(',');
                                        const lastDot = clean.lastIndexOf('.');
                                        let parsed = 0;
                                        if (lastComma > lastDot) parsed = parseFloat(clean.replace(/\./g, '').replace(',', '.'));
                                        else if (lastDot > lastComma) parsed = parseFloat(clean.replace(/,/g, ''));
                                        else parsed = parseFloat(clean.replace(',', '.'));
                                        return acc + (parsed || 0);
                                    }, 0).toLocaleString()}
                            </div>
                        </div>
                        <div className="scroll-x-auto">
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--color-border)' }}>
                                        <th style={{ padding: '1rem' }}>Producto</th>
                                        <th style={{ padding: '1rem' }}>Cantidad</th>
                                        <th style={{ padding: '1rem' }}>Fecha</th>
                                        <th style={{ padding: '1rem' }}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {gastos
                                        .filter(g => {
                                            const [d, m, y] = g['Fecha compra'].split('/').map(n => parseInt(n));
                                            if (filterMonth !== 0 && m !== filterMonth) return false;
                                            if (filterYear !== 0 && y !== filterYear) return false;
                                            return true;
                                        })
                                        .map((item, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid var(--color-background)' }}>
                                                <td style={{ padding: '1rem', fontWeight: '600' }}>{item.Producto}</td>
                                                <td style={{ padding: '1rem' }}>{item.Cantidad}</td>
                                                <td style={{ padding: '1rem' }}>{item['Fecha compra']}</td>
                                                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{item.Total}</td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>

            {/* AI Agent Chat */}
            <AIChat data={{ inventario, gastos }} />
        </div>
    );
}
