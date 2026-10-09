import React, { useState } from 'react';
import { 
  ShieldCheck, 
  UserPlus, 
  Edit, 
  Trash2, 
  X, 
  Check, 
  User, 
  Lock, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { Role, UserAccount, UserPermissions } from '../types';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserAccount[];
  currentUser: UserAccount;
  onSaveUser: (userData: UserAccount) => void;
  onDeleteUser: (userId: string) => void;
}

const DEFAULT_PERMISSIONS: Record<Role, UserPermissions> = {
  admin: {
    canAddWorker: true,
    canEditWorker: true,
    canDeleteWorker: true,
    canReserveWorker: true,
    canCancelReservation: true,
    canBuildCv: true,
    canManageArchive: true,
    canManageVisas: true,
    canExportReports: true,
    canEditCompany: true,
    canManageUsers: true,
  },
  manager: {
    canAddWorker: true,
    canEditWorker: true,
    canDeleteWorker: false,
    canReserveWorker: true,
    canCancelReservation: true,
    canBuildCv: true,
    canManageArchive: true,
    canManageVisas: true,
    canExportReports: true,
    canEditCompany: false,
    canManageUsers: false,
  },
  staff: {
    canAddWorker: true,
    canEditWorker: true,
    canDeleteWorker: false,
    canReserveWorker: true,
    canCancelReservation: false,
    canBuildCv: true,
    canManageArchive: false,
    canManageVisas: false,
    canExportReports: false,
    canEditCompany: false,
    canManageUsers: false,
  },
  driver: {
    canAddWorker: false,
    canEditWorker: false,
    canDeleteWorker: false,
    canReserveWorker: false,
    canCancelReservation: false,
    canBuildCv: false,
    canManageArchive: false,
    canManageVisas: false,
    canExportReports: false,
    canEditCompany: false,
    canManageUsers: false,
  },
};

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  users,
  currentUser,
  onSaveUser,
  onDeleteUser,
}) => {
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<Role>('staff');
  const [roleTitle, setRoleTitle] = useState('کارمەند');
  const [active, setActive] = useState(true);
  const [permissions, setPermissions] = useState<UserPermissions>(DEFAULT_PERMISSIONS.staff);

  if (!isOpen) return null;

  const handleStartAdd = () => {
    setIsAddingNew(true);
    setEditingUser(null);
    setUsername('');
    setPassword('');
    setFullName('');
    setRole('staff');
    setRoleTitle('کارمەند');
    setActive(true);
    setPermissions(DEFAULT_PERMISSIONS.staff);
  };

  const handleStartEdit = (user: UserAccount) => {
    setIsAddingNew(false);
    setEditingUser(user);
    setUsername(user.username);
    setPassword(user.password || '');
    setFullName(user.fullName);
    setRole(user.role);
    setRoleTitle(user.roleTitle);
    setActive(user.active);
    setPermissions(user.permissions);
  };

  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
    const titles: Record<Role, string> = {
      admin: 'بەڕێوەبەری سەرەکی (Admin)',
      manager: 'بەڕێوەبەری کارگێڕی',
      staff: 'کارمەندی تۆمار و پەیوەندی',
      driver: 'شۆفێر و گواستنەوە',
    };
    setRoleTitle(titles[newRole]);
    setPermissions(DEFAULT_PERMISSIONS[newRole]);
  };

  const handleTogglePermission = (key: keyof UserPermissions) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const userData: UserAccount = {
      id: editingUser ? editingUser.id : `user-${Date.now()}`,
      username: username.trim().toLowerCase(),
      password: password.trim() || (editingUser?.password || '123456'),
      fullName: fullName.trim(),
      role,
      roleTitle,
      active,
      permissions,
      avatar: editingUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
    };

    onSaveUser(userData);
    setIsAddingNew(false);
    setEditingUser(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden text-right my-auto">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                بەڕێوەبردنی بەکارهێنەران و دیاریکردنی دەسەڵاتەکان (RBAC)
              </h3>
              <p className="text-xs text-slate-500">
                دانانی یوزەر بۆ ستاف و کۆنترۆڵکردنی ئەوەی کێ دەتوانێت چی بکات لە سیستەم
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Top user list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                هەژمارە چالاکەکانی سیستەم ({users.length})
              </h4>
              {!isAddingNew && !editingUser && (
                <button
                  onClick={handleStartAdd}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>زیادکردنی یوزەری نوێ</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {users.map((u) => {
                const isCurrent = u.id === currentUser.id;
                return (
                  <div
                    key={u.id}
                    className={`p-3.5 rounded-2xl border transition flex flex-col justify-between ${
                      editingUser?.id === u.id
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {u.roleTitle}
                        </span>
                        {isCurrent && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                            هەژماری تۆیە
                          </span>
                        )}
                      </div>
                      <h5 className="font-bold text-xs text-slate-900 dark:text-white mt-2">
                        {u.fullName}
                      </h5>
                      <p className="text-[11px] text-slate-400 font-mono">@{u.username}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleStartEdit(u)}
                        className="p-1.5 rounded-lg bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 text-xs"
                        title="دەستکاری"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      {!isCurrent && (
                        <button
                          onClick={() => onDeleteUser(u.id)}
                          className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600 hover:bg-rose-100 text-xs"
                          title="سڕینەوە"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form for Add / Edit */}
          {(isAddingNew || editingUser) && (
            <div className="p-5 rounded-3xl border-2 border-indigo-500/40 bg-slate-50 dark:bg-slate-800/60 space-y-4">
              <div className="flex items-center justify-between border-b pb-2 dark:border-slate-700">
                <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  <span>{isAddingNew ? 'زیادکردنی بەکارهێنەری نوێ' : `دەستکاری (${editingUser?.fullName})`}</span>
                </h4>
                <button
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingUser(null);
                  }}
                  className="text-xs text-slate-400 hover:text-slate-700"
                >
                  داخستنی فۆڕم
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold mb-1">ناوی تەواوی کەسەکە *</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="ناوی چواری کارمەند..."
                      className="w-full px-3 py-2 rounded-xl border text-xs bg-white dark:bg-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">ناوی بەکارهێنەر (Username) *</label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="username"
                      className="w-full px-3 py-2 rounded-xl border text-xs bg-white dark:bg-slate-800 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">وشەی نهێنی (Password) *</label>
                    <input
                      type="text"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="password123"
                      className="w-full px-3 py-2 rounded-xl border text-xs bg-white dark:bg-slate-800 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">ڕۆڵ و پلە (Role Preset)</label>
                    <select
                      value={role}
                      onChange={(e) => handleRoleChange(e.target.value as Role)}
                      className="w-full px-3 py-2 rounded-xl border text-xs bg-white dark:bg-slate-800 font-semibold"
                    >
                      <option value="admin">بەڕێوەبەری سەرەکی (Admin - دەسەڵاتی تەواو)</option>
                      <option value="manager">بەڕێوەبەری کارگێڕی (Manager)</option>
                      <option value="staff">کارمەندی تۆمار (Staff)</option>
                      <option value="driver">شۆفێر (Driver)</option>
                    </select>
                  </div>
                </div>

                {/* Granular Permissions Matrix */}
                <div className="pt-3 border-t dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-2">
                    دەسەڵاتە دیاریکراوەکان بۆ ئەم بەکارهێنەرە (چی بتوانێت بکات و چی نەتوانێت):
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    
                    <label className="p-2.5 rounded-xl border bg-white dark:bg-slate-800 flex items-center justify-between text-xs cursor-pointer">
                      <span>زیادکردنی کرێکار و سیڤی</span>
                      <input
                        type="checkbox"
                        checked={permissions.canAddWorker}
                        onChange={() => handleTogglePermission('canAddWorker')}
                        className="rounded text-indigo-600"
                      />
                    </label>

                    <label className="p-2.5 rounded-xl border bg-white dark:bg-slate-800 flex items-center justify-between text-xs cursor-pointer">
                      <span>دەستکاری زانیارییەکانی کرێکار</span>
                      <input
                        type="checkbox"
                        checked={permissions.canEditWorker}
                        onChange={() => handleTogglePermission('canEditWorker')}
                        className="rounded text-indigo-600"
                      />
                    </label>

                    <label className="p-2.5 rounded-xl border bg-white dark:bg-slate-800 flex items-center justify-between text-xs cursor-pointer">
                      <span>سڕینەوەی کرێکار (Delete)</span>
                      <input
                        type="checkbox"
                        checked={permissions.canDeleteWorker}
                        onChange={() => handleTogglePermission('canDeleteWorker')}
                        className="rounded text-rose-600"
                      />
                    </label>

                    <label className="p-2.5 rounded-xl border bg-white dark:bg-slate-800 flex items-center justify-between text-xs cursor-pointer">
                      <span>حجزکردنی سیڤی کرێکاران</span>
                      <input
                        type="checkbox"
                        checked={permissions.canReserveWorker}
                        onChange={() => handleTogglePermission('canReserveWorker')}
                        className="rounded text-indigo-600"
                      />
                    </label>

                    <label className="p-2.5 rounded-xl border bg-white dark:bg-slate-800 flex items-center justify-between text-xs cursor-pointer">
                      <span>هەڵوەشاندنەوەی حجز</span>
                      <input
                        type="checkbox"
                        checked={permissions.canCancelReservation}
                        onChange={() => handleTogglePermission('canCancelReservation')}
                        className="rounded text-indigo-600"
                      />
                    </label>

                    <label className="p-2.5 rounded-xl border bg-white dark:bg-slate-800 flex items-center justify-between text-xs cursor-pointer">
                      <span>دروستکردن و پرێنتی سیڤی A4</span>
                      <input
                        type="checkbox"
                        checked={permissions.canBuildCv}
                        onChange={() => handleTogglePermission('canBuildCv')}
                        className="rounded text-indigo-600"
                      />
                    </label>

                    <label className="p-2.5 rounded-xl border bg-white dark:bg-slate-800 flex items-center justify-between text-xs cursor-pointer">
                      <span>بەڕێوەبردنی ئەرشیف و نوسراوەکان</span>
                      <input
                        type="checkbox"
                        checked={permissions.canManageArchive}
                        onChange={() => handleTogglePermission('canManageArchive')}
                        className="rounded text-indigo-600"
                      />
                    </label>

                    <label className="p-2.5 rounded-xl border bg-white dark:bg-slate-800 flex items-center justify-between text-xs cursor-pointer">
                      <span>بەڕێوەبردنی ڤیزاکان</span>
                      <input
                        type="checkbox"
                        checked={permissions.canManageVisas}
                        onChange={() => handleTogglePermission('canManageVisas')}
                        className="rounded text-indigo-600"
                      />
                    </label>

                    <label className="p-2.5 rounded-xl border bg-white dark:bg-slate-800 flex items-center justify-between text-xs cursor-pointer">
                      <span>ئێکسپۆرتکردنی ڕاپۆرتەکان</span>
                      <input
                        type="checkbox"
                        checked={permissions.canExportReports}
                        onChange={() => handleTogglePermission('canExportReports')}
                        className="rounded text-indigo-600"
                      />
                    </label>

                    <label className="p-2.5 rounded-xl border bg-white dark:bg-slate-800 flex items-center justify-between text-xs cursor-pointer">
                      <span>دەستکاری پرۆفایلی کۆمپانیا</span>
                      <input
                        type="checkbox"
                        checked={permissions.canEditCompany}
                        onChange={() => handleTogglePermission('canEditCompany')}
                        className="rounded text-indigo-600"
                      />
                    </label>

                    <label className="p-2.5 rounded-xl border bg-white dark:bg-slate-800 flex items-center justify-between text-xs cursor-pointer">
                      <span>بەڕێوەبردنی بەکارهێنەرانی تر</span>
                      <input
                        type="checkbox"
                        checked={permissions.canManageUsers}
                        onChange={() => handleTogglePermission('canManageUsers')}
                        className="rounded text-indigo-600"
                      />
                    </label>

                  </div>
                </div>

                <div className="pt-3 border-t dark:border-slate-700 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingNew(false);
                      setEditingUser(null);
                    }}
                    className="px-4 py-2 rounded-xl border text-xs font-semibold"
                  >
                    پاشگەزبوونەوە
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                  >
                    پاشەکەوتکردنی هەژمار و دەسەڵاتەکان
                  </button>
                </div>

              </form>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
