/**
 * @module components/branches/BranchFormDialog
 *
 * Create/Edit branch dialog using React Hook Form with `register`
 * (§46: `Controller` is reserved for MUI X pickers; MuiTextField
 * forwards its ref → `register` works directly) on MuiTextField
 * fields with start adornments, §46.4/§56.4. Submit posts through the
 * §42 redux layer (branchesSlice mutations), toasts success/error,
 * and lets the page close the dialog on success.
 */

import { useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { Business, LocationOn } from "@mui/icons-material";
import MuiDialog from "../reusable/MuiDialog.jsx";
import MuiButton from "../reusable/MuiButton.jsx";
import MuiTextField from "../reusable/MuiTextField.jsx";
import {
  useCreateBranchMutation,
  useUpdateBranchMutation,
} from "../../redux/features/branchesSlice.js";
import { showToast } from "../../utils/toast.js";
import {
  BRANCHES_COPY,
  BRANCH_NAME_MAX_LENGTH,
  BRANCH_LOCATION_MAX_LENGTH,
  TOAST_CATALOGUE,
} from "../../utils/constants.js";
import CircularProgress from "@mui/material/CircularProgress";

/**
 * Create/Edit branch dialog.
 * @param {Object} props - Component props.
 * @param {boolean} props.open - Dialog open state.
 * @param {Function} props.onClose - Close handler.
 * @param {boolean} props.isEdit - Whether in edit mode.
 * @param {Object} [props.initialData] - Initial data for edit mode.
 * @returns {JSX.Element} The form dialog.
 */
export const BranchFormDialog = ({ open, onClose, isEdit, initialData }) => {
  const [createBranch, { isLoading: isCreating }] = useCreateBranchMutation();
  const [updateBranch, { isLoading: isUpdating }] = useUpdateBranchMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onBlur",
    defaultValues: { name: "", location: "" },
  });

  const isLoading = isCreating || isUpdating || isSubmitting;

  // A36: seed the form when the dialog opens / the edit target changes —
  // `initialData` is read only once by `useForm`, so this effect resets the
  // fields for edit mode (fixes stale defaultValues, §56.4/dialog).
  useEffect(() => {
    reset({
      name: initialData?.name ?? "",
      location: initialData?.location ?? "",
    });
  }, [open, initialData, reset]);

  /**
   * Posts the branch through the §42 redux layer; on success toasts and
   * lets the page close the dialog; on failure toasts (never setError —
   * server errors surface through toasts, ADR-033/§9.6).
   * @param {{name: string, location: string}} values - Form values.
   * @returns {Promise<void>}
   */
  const handleSubmitForm = useCallback(
    async (values) => {
      try {
        if (isEdit && initialData?._id) {
          await updateBranch({
            branchId: initialData._id,
            ...values,
          }).unwrap();
          showToast("success", TOAST_CATALOGUE.branches.updated);
        } else {
          await createBranch(values).unwrap();
          showToast("success", TOAST_CATALOGUE.branches.created);
        }
        reset({ name: "", location: "" });
        onClose();
      } catch (error) {
        showToast(
          "error",
          error?.message ?? "Something went wrong — please try again",
        );
      }
    },
    [isEdit, initialData, createBranch, updateBranch, reset, onClose],
  );

  return (
    <MuiDialog
      open={open}
      onClose={onClose}
      title={
        isEdit
          ? BRANCHES_COPY.dialog.editTitle
          : BRANCHES_COPY.dialog.createTitle
      }
      maxWidth="sm"
      fullWidth
      actions={
        <>
          <MuiButton variant="text" onClick={onClose} disabled={isLoading}>
            {BRANCHES_COPY.dialog.cancelLabel}
          </MuiButton>
          <MuiButton
            variant="contained"
            type="submit"
            form="branch-form"
            disabled={isLoading}
            loading={isLoading}
            loadingIndicator={<CircularProgress size={20} />}
          >
            {isEdit
              ? BRANCHES_COPY.dialog.submitEditLabel
              : BRANCHES_COPY.dialog.submitCreateLabel}
          </MuiButton>
        </>
      }
    >
      <form
        id="branch-form"
        noValidate
        onSubmit={handleSubmit(handleSubmitForm)}
      >
        <MuiTextField
          label={BRANCHES_COPY.dialog.nameLabel}
          required
          maxLength={BRANCH_NAME_MAX_LENGTH}
          fullWidth
          error={Boolean(errors.name)}
          helperText={errors.name?.message}
          startAdornment={<Business fontSize="small" />}
          {...register("name", {
            required: BRANCHES_COPY.dialog.nameRequired,
            maxLength: {
              value: BRANCH_NAME_MAX_LENGTH,
              message: BRANCHES_COPY.dialog.nameTooLong,
            },
          })}
          sx={{ mb: 2 }}
        />
        <MuiTextField
          label={BRANCHES_COPY.dialog.locationLabel}
          required
          maxLength={BRANCH_LOCATION_MAX_LENGTH}
          fullWidth
          error={Boolean(errors.location)}
          helperText={errors.location?.message}
          startAdornment={<LocationOn fontSize="small" />}
          {...register("location", {
            required: BRANCHES_COPY.dialog.locationRequired,
            maxLength: {
              value: BRANCH_LOCATION_MAX_LENGTH,
              message: BRANCHES_COPY.dialog.locationTooLong,
            },
          })}
        />
      </form>
    </MuiDialog>
  );
};

export default BranchFormDialog;
