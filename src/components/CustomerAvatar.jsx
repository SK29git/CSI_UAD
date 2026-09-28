import React from 'react';

export function getGender(customer) {
  if (!customer) return 'male';
  const salutation = (customer.salutation || '').toLowerCase();
  const firstName = (customer.firstName || '').toLowerCase();
  const fullName = (customer.fullName || '').toLowerCase();

  const femaleSalutations = ['mrs.', 'mrs', 'ms.', 'ms', 'miss', 'madam', 'lady', 'sheikha'];
  if (femaleSalutations.some(s => salutation.includes(s))) return 'female';

  const femaleNames = ['maya', 'fatima', 'noora', 'sara', 'sarah', 'aisha', 'mariam', 'reem', 'hessa', 'dana', 'laila', 'wed', 'noaf', 'mrs', 'ms'];
  if (femaleNames.some(n => firstName.includes(n) || fullName.includes(n))) return 'female';

  return 'male';
}

export function getInitials(customer) {
  if (!customer) return 'CU';
  const first = customer.firstName || '';
  const sur = customer.surname || '';
  const full = customer.fullName || '';

  if (first && sur) return `${first[0]}${sur[0]}`.toUpperCase();
  if (full) {
    const parts = full.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return full.slice(0, 2).toUpperCase();
  }
  return 'CU';
}

export default function CustomerAvatar({ customer, size = "w-14 h-14", className = "" }) {
  const gender = getGender(customer);
  const initials = getInitials(customer);

  const maleAvatarUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200";
  const femaleAvatarUrl = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200";

  const avatarUrl = gender === 'female' ? femaleAvatarUrl : maleAvatarUrl;

  return (
    <div className={`relative flex-shrink-0 ${className}`}>
      <img
        src={avatarUrl}
        alt={customer?.fullName || 'Customer Avatar'}
        className={`${size} rounded-full object-cover border-2 ${gender === 'female' ? 'border-pink-300' : 'border-blue-300'} shadow-sm`}
        onError={(e) => {
          // Fallback to stylized initials badge if image fails to load
          e.target.onerror = null;
          e.target.style.display = 'none';
          if (e.target.nextSibling) {
            e.target.nextSibling.style.display = 'flex';
          }
        }}
      />
      
      {/* Initials Fallback Badge */}
      <div 
        style={{ display: 'none' }}
        className={`${size} rounded-full ${
          gender === 'female' 
            ? 'bg-gradient-to-tr from-pink-500 to-purple-600' 
            : 'bg-gradient-to-tr from-blue-600 to-indigo-700'
        } text-white font-black flex items-center justify-center border-2 border-white shadow-sm text-sm`}
      >
        {initials}
      </div>

      {/* Online Status Dot */}
      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
    </div>
  );
}
