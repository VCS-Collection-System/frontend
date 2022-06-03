import React from 'react';
import { Modal, Button } from '@patternfly/react-core';

const DeleteConfirmationModal = ({...props}) => {

 

    return (
      <React.Fragment>
        <Modal
          aria-label="My modal context"
          title="Delete Vaccine record"
          isOpen={props.isModalOpen}
          onClose={() => props.setIsModalOpen(false)}
           actions={[
            <Button key="confirm" variant="primary" onClick={() =>props.handleDelete()}>
              Confirm
            </Button>,
            <Button key="cancel" variant="link" onClick={() => props.setIsModalOpen(false)}>
              Cancel
            </Button>
          ]}
        >
          Do you want to delete this record?
        </Modal>
      </React.Fragment>
    );
  }


export default DeleteConfirmationModal;