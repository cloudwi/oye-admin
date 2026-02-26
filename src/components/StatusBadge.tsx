interface Props {
  status: 'PENDING' | 'ANSWERED';
}

export default function StatusBadge({ status }: Props) {
  const styles = status === 'PENDING'
    ? 'bg-yellow-100 text-yellow-800'
    : 'bg-green-100 text-green-800';

  const label = status === 'PENDING' ? '대기중' : '답변완료';

  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${styles}`}>
      {label}
    </span>
  );
}
