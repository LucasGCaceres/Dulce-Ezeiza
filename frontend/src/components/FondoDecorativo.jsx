import './FondoDecorativo.css'

function FondoDecorativo() {
  return (
    <div className="fondo-decorativo" aria-hidden="true">
      <svg className="garabato garabato-1" viewBox="0 0 100 100" width="140" height="140">
        <path d="M20 60 Q35 20 60 25 Q85 30 80 55 Q75 75 50 78 Q30 80 20 60 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M35 45 Q45 40 55 45" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M38 55 Q48 50 58 55" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>

      <svg className="garabato garabato-2" viewBox="0 0 100 100" width="160" height="160">
        <path d="M15 65 Q15 35 50 35 Q85 35 85 65 Q85 80 50 80 Q15 80 15 65 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M30 40 Q35 55 30 68" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M50 37 Q55 55 50 78" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M70 40 Q65 55 70 68" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>

      <svg className="garabato garabato-3" viewBox="0 0 100 100" width="130" height="130">
        <path d="M25 40 H65 V65 Q65 80 45 80 Q25 80 25 65 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M65 48 Q80 48 80 58 Q80 68 65 66" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M35 30 Q38 22 34 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M48 30 Q51 22 47 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>

      <svg className="garabato garabato-4" viewBox="0 0 100 100" width="130" height="130">
        <path d="M30 55 L70 55 L62 85 Q50 92 38 85 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M28 55 Q50 20 72 55" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="50" cy="20" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>

      <svg className="garabato garabato-5" viewBox="0 0 100 100" width="110" height="110">
        <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="38" cy="40" r="3" fill="currentColor" stroke="none" />
        <circle cx="60" cy="35" r="3" fill="currentColor" stroke="none" />
        <circle cx="55" cy="60" r="3" fill="currentColor" stroke="none" />
        <circle cx="35" cy="62" r="3" fill="currentColor" stroke="none" />
        <circle cx="65" cy="55" r="3" fill="currentColor" stroke="none" />
      </svg>

      <svg className="garabato garabato-6" viewBox="0 0 100 100" width="120" height="120">
        <path d="M50 20 L80 75 Q50 90 20 75 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M30 70 Q50 78 70 70" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M50 20 Q45 45 50 65" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>

      <svg className="garabato garabato-7" viewBox="0 0 100 100" width="90" height="90">
        <path d="M50 20 Q75 25 75 50 Q75 75 50 80 Q25 75 25 50 Q25 25 50 20 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M50 25 Q45 50 50 75" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  )
}

export default FondoDecorativo