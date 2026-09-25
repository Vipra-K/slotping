import {useEffect,useMemo,useState} from 'react';
import {CalendarDays,ChevronLeft,ChevronRight,Clock3,LogOut,MessageCircle,Plus,RefreshCw,Send,Trash2,X} from 'lucide-react';
import {api,Appointment,AuthResponse} from './api';

const todayISO=()=>{const d=new Date();const off=d.getTimezoneOffset();return new Date(d.getTime()-off*60000).toISOString().slice(0,10)};
const fmtTime=(value:string)=>new Date(value).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
const fmtDate=(value:string)=>new Date(value+'T00:00:00').toLocaleDateString([],{weekday:'long',month:'long',day:'numeric',year:'numeric'});

function App(){
 const [token,setToken]=useState(localStorage.getItem('slotping_token'));
 const [business,setBusiness]=useState(()=>{try{return JSON.parse(localStorage.getItem('slotping_business')||'null')}catch{return null}});
 if(!token||!business)return <Login onLogin={(r:AuthResponse)=>{localStorage.setItem('slotping_token',r.accessToken);localStorage.setItem('slotping_business',JSON.stringify(r.business));setToken(r.accessToken);setBusiness(r.business)}}/>;
 return <Dashboard business={business} onLogout={()=>{localStorage.removeItem('slotping_token');localStorage.removeItem('slotping_business');setToken(null);setBusiness(null)}}/>;
}

function Login({onLogin}:{onLogin:(r:AuthResponse)=>void}){
 const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [loading,setLoading]=useState(false);const [error,setError]=useState('');
 const submit=async(e:React.FormEvent)=>{e.preventDefault();setError('');setLoading(true);try{onLogin(await api.login(email,password))}catch(err){setError(err instanceof Error?err.message:'Unable to log in')}finally{setLoading(false)}};
 return <main className="auth-page"><div className="auth-card"><div className="brand-mark">S</div><h1>Welcome to SlotPing</h1><p className="muted">Simple appointment reminders, handled.</p><form onSubmit={submit}><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email"/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required autoComplete="current-password"/></label>{error&&<div className="error">{error}</div>}<button className="primary wide" disabled={loading}>{loading?'Logging in…':'Log In'}</button></form></div></main>;
}

function Dashboard({business,onLogout}:{business:{name:string};onLogout:()=>void}){
 const [date,setDate]=useState(todayISO());const [appointments,setAppointments]=useState<Appointment[]>([]);const [loading,setLoading]=useState(true);const [error,setError]=useState('');const [newOpen,setNewOpen]=useState(false);const [delayAppt,setDelayAppt]=useState<Appointment|null>(null);const [toast,setToast]=useState('');
 const load=async()=>{setLoading(true);setError('');try{setAppointments(await api.appointments(date))}catch(e){setError(e instanceof Error?e.message:'Could not load appointments')}finally{setLoading(false)}};
 useEffect(()=>{load()},[date]);
 useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(''),3500);return()=>clearTimeout(t)},[toast]);
 const dateLabel=useMemo(()=>fmtDate(date),[date]);
 const changeDate=(n:number)=>{const d=new Date(date+'T00:00:00');d.setDate(d.getDate()+n);const off=d.getTimezoneOffset();setDate(new Date(d.getTime()-off*60000).toISOString().slice(0,10))};
 const save=async(body:{customerName:string;customerPhone:string;service:string;appointmentAt:string})=>{await api.create(body);setNewOpen(false);setToast('Appointment saved and WhatsApp confirmation sent.');await load()};
 const delay=async(minutes:number)=>{if(!delayAppt)return;await api.delay(delayAppt.id,minutes);setDelayAppt(null);setToast('Delay alert sent to the customer.')};
 const setStatus=async(a:Appointment,status:Appointment['status'])=>{await api.status(a.id,status);await load()};
 return <div className="app-shell"><header className="topbar"><div><div className="logo">SlotPing</div><div className="business-name">{business.name}</div></div><div className="top-actions"><button className="icon-btn" title="Refresh" onClick={load}><RefreshCw size={18}/></button><button className="logout" onClick={onLogout}><LogOut size={16}/>Log out</button></div></header>
 <main className="dashboard"><div className="page-heading"><div><p className="eyebrow">Today’s appointments</p><h2>{dateLabel}</h2></div><button className="primary" onClick={()=>setNewOpen(true)}><Plus size={18}/>New Appointment</button></div>
 <div className="date-nav"><button className="date-arrow" onClick={()=>changeDate(-1)}><ChevronLeft size={18}/></button><button className={date===todayISO()?'today-pill active':'today-pill'} onClick={()=>setDate(todayISO())}>Today</button><button className="date-arrow" onClick={()=>changeDate(1)}><ChevronRight size={18}/></button><span className="date-hint"><CalendarDays size={15}/>{date===todayISO()?'Your schedule for today':'Viewing another day'}</span></div>
 {error&&<div className="error banner">{error}</div>}
 {loading?<div className="loading"><span className="spinner"/>Loading your appointments…</div>:appointments.length===0?<EmptyState onNew={()=>setNewOpen(true)}/>:<AppointmentList appointments={appointments} onDelay={setDelayAppt} onStatus={setStatus}/>}
 </main>
 {newOpen&&<NewAppointmentModal onClose={()=>setNewOpen(false)} onSave={save} defaultDate={date}/>}
 {delayAppt&&<DelayModal appointment={delayAppt} onClose={()=>setDelayAppt(null)} onSend={delay}/>}
 {toast&&<div className="toast"><span className="toast-icon"><MessageCircle size={16}/></span>{toast}</div>}
 </div>
}

function EmptyState({onNew}:{onNew:()=>void}){return <section className="empty-card"><div className="empty-icon"><CalendarDays size={28}/></div><h3>No appointments yet</h3><p>Nothing is scheduled for this day. Add an appointment and SlotPing will notify your customer on WhatsApp.</p><button className="primary" onClick={onNew}><Plus size={18}/>New Appointment</button></section>}

function AppointmentList({appointments,onDelay,onStatus}:{appointments:Appointment[];onDelay:(a:Appointment)=>void;onStatus:(a:Appointment,s:Appointment['status'])=>void}){
 return <section className="table-card"><div className="table-head"><span>{appointments.length} appointment{appointments.length===1?'':'s'}</span><span className="head-note">WhatsApp notifications are handled automatically</span></div><div className="appointment-list"><div className="row labels"><span>Customer</span><span>Service</span><span>Time</span><span>Status</span><span></span></div>{appointments.map(a=><div className="row" key={a.id}><div className="customer"><div className="avatar">{a.id.slice(0,1).toUpperCase()}</div><strong>{a.customerId.slice(0,8)}</strong></div><span>{a.service}</span><span className="time"><Clock3 size={15}/>{fmtTime(a.appointmentAt)}</span><select className={'status '+a.status} value={a.status} onChange={e=>onStatus(a,e.target.value as Appointment['status'])}><option value="confirmed">Confirmed</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select><button className="secondary" onClick={()=>onDelay(a)}><Send size={15}/>Notify Delay</button></div>)}</div></section>
}

function NewAppointmentModal({onClose,onSave,defaultDate}:{onClose:()=>void;onSave:(b:{customerName:string;customerPhone:string;service:string;appointmentAt:string})=>Promise<void>;defaultDate:string}){
 const [name,setName]=useState('');const [phone,setPhone]=useState('');const [service,setService]=useState('');const [date,setDate]=useState(defaultDate);const [time,setTime]=useState('10:00');const [error,setError]=useState('');const [saving,setSaving]=useState(false);
 const submit=async(e:React.FormEvent)=>{e.preventDefault();if(!/^\+?[1-9]\d{7,14}$/.test(phone.replace(/[\s()-]/g,''))){setError('Enter a valid phone number with country code, for example +91 9876543210.');return}setSaving(true);setError('');try{await onSave({customerName:name,customerPhone:phone,service,appointmentAt:new Date(date+'T'+time).toISOString()})}catch(err){setError(err instanceof Error?err.message:'Could not save appointment')}finally{setSaving(false)}};
 return <Modal title="New Appointment" onClose={onClose}><form onSubmit={submit} className="modal-form"><label>Customer Name<input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Priya Kumar" required/></label><label>Phone Number<input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+91 9876543210" required/><small>Include country code, e.g. +91</small></label><label>Service<input value={service} onChange={e=>setService(e.target.value)} placeholder="e.g. Haircut" required/></label><div className="two-col"><label>Date<input type="date" value={date} onChange={e=>setDate(e.target.value)} required/></label><label>Time<input type="time" value={time} onChange={e=>setTime(e.target.value)} required/></label></div>{error&&<div className="error">{error}</div>}<button className="primary wide" disabled={saving}>{saving?'Saving & notifying…':'Save & Notify Customer'}</button></form></Modal>
}

function DelayModal({appointment,onClose,onSend}:{appointment:Appointment;onClose:()=>void;onSend:(n:number)=>Promise<void>}){
 const [selected,setSelected]=useState<number|null>(null);const [custom,setCustom]=useState('');const [sending,setSending]=useState(false);const value=selected??(custom?Number(custom):0);
 const send=async()=>{if(!value||value<1||value>600)return;setSending(true);try{await onSend(value)}finally{setSending(false)}};
 return <Modal title="Notify Delay" subtitle="Let your customer know you’re running a little behind." onClose={onClose}><div className="delay-content"><div className="delay-customer"><div className="avatar large">{appointment.id.slice(0,1).toUpperCase()}</div><div><strong>Appointment at {fmtTime(appointment.appointmentAt)}</strong><span>{appointment.service}</span></div></div><p className="field-label">How late are you?</p><div className="quick-delays">{[10,20,30].map(n=><button key={n} className={selected===n?'delay-chip selected':'delay-chip'} onClick={()=>{setSelected(n);setCustom('')}}>{n} min</button>)}</div><label>Custom delay (minutes)<input type="number" min="1" max="600" value={custom} onChange={e=>{setCustom(e.target.value);setSelected(null)}} placeholder="e.g. 45"/></label><button className="primary wide" disabled={!value||sending} onClick={send}><Send size={17}/>{sending?'Sending…':'Send Alert'}</button></div></Modal>
}

function Modal({title,subtitle,onClose,children}:{title:string;subtitle?:string;onClose:()=>void;children:React.ReactNode}){return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><div className="modal"><div className="modal-header"><div><h3>{title}</h3>{subtitle&&<p>{subtitle}</p>}</div><button className="close-btn" onClick={onClose}><X size={19}/></button></div>{children}</div></div>}

export default App;