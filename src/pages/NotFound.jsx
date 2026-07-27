import ErrorState from '@/components/ui/ErrorState';

const NotFound = () => {
  return (
    <div className="container section">
      <ErrorState
        title="Page out of catalogue"
        message="The address you are looking for does not exist."
      />
    </div>
  );
};

export default NotFound;
