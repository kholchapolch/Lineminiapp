import "./page-error.css";

type PageErrorProps = {
  title: string;
  message: string;
};

export function PageError({ title, message }: PageErrorProps): JSX.Element {
  return (
    <main className="pageError">
      <section className="pageError__panel" role="alert">
        <h1 className="pageError__title">{title}</h1>
        <p className="pageError__message">{message}</p>
      </section>
    </main>
  );
}
