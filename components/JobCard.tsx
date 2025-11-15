import { useCurrency } from "../components/CurrencyProvider";
import styles from "../app/pincome/page.module.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
export default function JobCard({ name, total, onClick, onDelete }: Props) {
  const { formatFromJPY } = useCurrency();

  return (
    <div className={styles.jobcard} onClick={onClick} role="button" tabIndex={0}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
        <div style={{ textAlign: "left" }}>
          <div className={styles.jobcardtitle}>{name}</div>
          <div className={styles.jobcardtotal} style={{ marginTop: 6 }}>
            {formatFromJPY(total)}
          </div>
        </div>
        <div style={{ marginLeft: 12 }}>
          <button
            type="button"
            className={styles.deletebtn}
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
          >
            <FontAwesomeIcon icon={faTrash}/>
          </button>
        </div>
      </div>
    </div>
  );
}
