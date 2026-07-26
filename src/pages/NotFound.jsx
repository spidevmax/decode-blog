import ErrorState from "../components/ErrorState";

const NotFound = () => {
	return (
		<div className="container section">
			<ErrorState
				title="Página fuera de catálogo"
				message="La dirección que buscas no existe."
			/>
		</div>
	);
};

export default NotFound;
