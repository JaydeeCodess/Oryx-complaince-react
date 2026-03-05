export default function Toast({ msg, type }) {
  return (
    <div id="toast" className={`show ${type}`}>{msg}</div>
  )
}
