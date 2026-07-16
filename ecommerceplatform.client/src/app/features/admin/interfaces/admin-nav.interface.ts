export interface IAdminNavItem {
  label: string;
  icon: string;
  route: string;
}

export interface IAdminNavGroup {
  title: string;
  items: IAdminNavItem[];
}
