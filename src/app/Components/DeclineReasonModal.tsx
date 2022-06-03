import * as React from 'react';
import { Button, Form, FormGroup, Modal, ModalVariant, Radio, Stack } from '@patternfly/react-core';
import { CheckCircleIcon } from '@patternfly/react-icons';
import { Controller, useForm } from "react-hook-form";

const DeclineReasonModal = ({...props}) => {
  const { control, handleSubmit } = useForm();

  const declineReasons = [
    "Attachments are not legible",
    "Supporting documentation is missing required information",
    "Supporting documentation is not in an acceptable format",
    "Supporting documentation differs from entered employee or vaccination information",
    "Other (more information to be provided)"
  ]

  const onSubmit = (data) => {
    props.sendReview(false, data["decline-reason"]);
  }

  return (
    <Modal
      isOpen={props.isModalOpen}
      onClose={() => props.setIsModalOpen(false)}
      title="Reason For Decline - Select Most Appropriate"
      variant={ModalVariant.medium}
    >
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="decline-reason"
          control={control}
          rules={{ required: true }}
          render={({ field, fieldState }) => (
            <FormGroup
              fieldId="decline-reason"
              isRequired
              validated={fieldState.error ? "error" : "default"}
              helperTextInvalid="* Please select a reason to proceed"
            >
              <Stack hasGutter>
                {declineReasons.map((reason, index) => (
                  <Radio
                    key={"radio-" + index}
                    name={"decline-reason-radio" + index}
                    id={"radio-controlled-" + index}
                    isChecked={field.value === reason}
                    onChange={(_, event) => field.onChange(event.currentTarget.value)}
                    label={reason}
                    value={reason}
                  />
                ))}
              </Stack>
            </FormGroup>
          )}
        />
        <FormGroup fieldId="decline-reason-buttons">
          <Button
            icon={<CheckCircleIcon />}
            isDisabled={props.isSendingReview}
            isLoading={props.isSendingReview}
            key="confirm"
            variant="primary"
            type="submit"
          >
            Confirm
          </Button>
          <Button
            key="cancel"
            onClick={() => props.setIsModalOpen(false)}
            variant="plain"
          >
            Cancel
          </Button>
        </FormGroup>
      </Form>
    </Modal>
  )
}

export default DeclineReasonModal;