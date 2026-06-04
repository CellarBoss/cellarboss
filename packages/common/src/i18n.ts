const en = {
  "app.name": "CellarBoss",
  "nav.dashboard": "Dashboard",
  "nav.cellar": "Cellar",
  "nav.wines": "Wines",
  "nav.bottles": "Bottles",
  "nav.tastingNotes": "Tasting Notes",
  "nav.grapes": "Grapes",
  "nav.winemakers": "Winemakers",
  "nav.storages": "Storages",
  "nav.locations": "Locations",
  "nav.regions": "Regions",
  "nav.countries": "Countries",
  "nav.profile": "Profile",
  "nav.settings": "Settings",
  "nav.applicationSettings": "Application Settings",
  "nav.users": "Users",
  "nav.more": "More",
  "section.wineData": "Wine Data",
  "section.referenceData": "Reference Data",
  "section.storage": "Storage",
  "section.geography": "Geography",
  "section.account": "Account",
  "section.appearance": "Appearance",
  "section.server": "CellarBoss Server",
  "section.mobile": "CellarBoss Mobile",
  "action.toggleTheme": "Toggle theme",
  "action.collapseSidebar": "Collapse sidebar",
  "action.expandSidebar": "Expand sidebar",
  "action.signOut": "Sign Out",
  "action.logOut": "Log out",
  "theme.title": "Theme",
  "theme.light": "Light",
  "theme.dark": "Dark",
  "theme.system": "System default",
  "settings.language": "Language",
  "settings.editSetting": "Edit Setting",
  "settings.systemSettings": "System Settings",
  "settings.noSettings": "No settings configured yet.",
  "settings.noPermission":
    "You do not have permission to access this page. Admin rights are required.",
  "status.unknown": "Unknown",
  "server.url": "URL",
  "server.version": "Version",
  "mobile.applicationVersion": "Application Version",
} as const;

export type TranslationKey = keyof typeof en;
type TranslationMap = Record<TranslationKey, string>;

const es: TranslationMap = {
  "app.name": "CellarBoss",
  "nav.dashboard": "Panel",
  "nav.cellar": "Bodega",
  "nav.wines": "Vinos",
  "nav.bottles": "Botellas",
  "nav.tastingNotes": "Notas de cata",
  "nav.grapes": "Uvas",
  "nav.winemakers": "Productores",
  "nav.storages": "Almacenes",
  "nav.locations": "Ubicaciones",
  "nav.regions": "Regiones",
  "nav.countries": "Países",
  "nav.profile": "Perfil",
  "nav.settings": "Configuración",
  "nav.applicationSettings": "Configuración de la aplicación",
  "nav.users": "Usuarios",
  "nav.more": "Más",
  "section.wineData": "Datos de vino",
  "section.referenceData": "Datos de referencia",
  "section.storage": "Almacenamiento",
  "section.geography": "Geografía",
  "section.account": "Cuenta",
  "section.appearance": "Apariencia",
  "section.server": "Servidor CellarBoss",
  "section.mobile": "CellarBoss móvil",
  "action.toggleTheme": "Cambiar tema",
  "action.collapseSidebar": "Contraer barra lateral",
  "action.expandSidebar": "Expandir barra lateral",
  "action.signOut": "Cerrar sesión",
  "action.logOut": "Cerrar sesión",
  "theme.title": "Tema",
  "theme.light": "Claro",
  "theme.dark": "Oscuro",
  "theme.system": "Predeterminado del sistema",
  "settings.language": "Idioma",
  "settings.editSetting": "Editar configuración",
  "settings.systemSettings": "Configuración del sistema",
  "settings.noSettings": "No hay configuración disponible.",
  "settings.noPermission":
    "No tienes permiso para acceder a esta página. Se requieren permisos de administrador.",
  "status.unknown": "Desconocido",
  "server.url": "URL",
  "server.version": "Versión",
  "mobile.applicationVersion": "Versión de la aplicación",
};

const fr: TranslationMap = {
  "app.name": "CellarBoss",
  "nav.dashboard": "Tableau de bord",
  "nav.cellar": "Cave",
  "nav.wines": "Vins",
  "nav.bottles": "Bouteilles",
  "nav.tastingNotes": "Notes de dégustation",
  "nav.grapes": "Cépages",
  "nav.winemakers": "Producteurs",
  "nav.storages": "Stockages",
  "nav.locations": "Emplacements",
  "nav.regions": "Régions",
  "nav.countries": "Pays",
  "nav.profile": "Profil",
  "nav.settings": "Paramètres",
  "nav.applicationSettings": "Paramètres de l'application",
  "nav.users": "Utilisateurs",
  "nav.more": "Plus",
  "section.wineData": "Données des vins",
  "section.referenceData": "Données de référence",
  "section.storage": "Stockage",
  "section.geography": "Géographie",
  "section.account": "Compte",
  "section.appearance": "Apparence",
  "section.server": "Serveur CellarBoss",
  "section.mobile": "CellarBoss mobile",
  "action.toggleTheme": "Changer de thème",
  "action.collapseSidebar": "Réduire la barre latérale",
  "action.expandSidebar": "Développer la barre latérale",
  "action.signOut": "Se déconnecter",
  "action.logOut": "Se déconnecter",
  "theme.title": "Thème",
  "theme.light": "Clair",
  "theme.dark": "Sombre",
  "theme.system": "Valeur par défaut du système",
  "settings.language": "Langue",
  "settings.editSetting": "Modifier le paramètre",
  "settings.systemSettings": "Paramètres du système",
  "settings.noSettings": "Aucun paramètre configuré.",
  "settings.noPermission":
    "Vous n'avez pas l'autorisation d'accéder à cette page. Les droits administrateur sont requis.",
  "status.unknown": "Inconnu",
  "server.url": "URL",
  "server.version": "Version",
  "mobile.applicationVersion": "Version de l'application",
};

export const DEFAULT_LANGUAGE = "en";

export const SUPPORTED_LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
] as const;

export type SupportedLanguage =
  (typeof SUPPORTED_LANGUAGE_OPTIONS)[number]["value"];

export const translations: Record<SupportedLanguage, TranslationMap> = {
  en,
  es,
  fr,
};

export function resolveLanguage(value: unknown): SupportedLanguage {
  if (typeof value !== "string") return DEFAULT_LANGUAGE;

  const normalized = value.trim().toLowerCase();
  const exact = SUPPORTED_LANGUAGE_OPTIONS.find(
    (option) => option.value === normalized,
  );
  if (exact) return exact.value;

  const baseLanguage = normalized.split("-")[0];
  const base = SUPPORTED_LANGUAGE_OPTIONS.find(
    (option) => option.value === baseLanguage,
  );
  return base?.value ?? DEFAULT_LANGUAGE;
}

export function translate(
  language: SupportedLanguage,
  key: TranslationKey,
): string {
  return translations[language][key] ?? translations[DEFAULT_LANGUAGE][key];
}

export function getLanguageLabel(value: unknown): string {
  const language = resolveLanguage(value);
  return (
    SUPPORTED_LANGUAGE_OPTIONS.find((option) => option.value === language)
      ?.label ?? "English"
  );
}
