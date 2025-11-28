import { useCurrency } from "../components/CurrencyProvider";
import styles from "../app/pincome/page.module.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

interface Props {
  name: string;
  total: number;
  onClick?: import("react").MouseEventHandler<HTMLDivElement>;
  onDelete?: () => void;
}

export default function JobCard({ name, total, onClick, onDelete }: Props) {
  const { formatFromJPY } = useCurrency();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();

    const confirmed = window.confirm("Are you sure you want to delete ?");

    if (confirmed) {
      onDelete?.();
    }
  };

  return (
    <div className={styles.jobcard} onClick={onClick} role="button" tabIndex={0}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
        <div style={{ textAlign: "left" }}>
          <div className={styles.jobcardtitle}>{name}</div>
        </div>
        <div style={{ marginLeft: 12 }}>
          <button
            type="button"
            className={styles.deletebtn}
            onClick={handleDelete}
          >
            <FontAwesomeIcon icon={faTrash}/>
          </button>
        </div>
      </div>
    </div>
  );
}
