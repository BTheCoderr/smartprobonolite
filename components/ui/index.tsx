export { StatusMessage } from './StatusMessage';

export function PrimaryButton(props: any) {
  return (
    <button
      {...props}
      className={`px-5 py-2.5 rounded-xl bg-spb-blue text-white hover:bg-spb-blueDark transition shadow-sm ${props.className || ''}`}
    />
  );
}

export function GhostButton(props: any) {
  return (
    <button
      {...props}
      className={`px-5 py-2.5 rounded-xl border border-spb-blue text-spb-blue hover:bg-blue-50 transition ${props.className || ''}`}
    />
  );
}

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl shadow-card p-6 ${className}`}>
      {children}
    </div>
  );
}

