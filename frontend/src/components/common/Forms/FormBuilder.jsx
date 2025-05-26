import React from 'react';
import PropTypes from 'prop-types';
import { Box, Grid, Button, Typography, Paper } from '@mui/material';
import TextField from './TextField/TextField';
import SelectField from './SelectField/SelectField';
import DatePicker from './DatePicker/DatePicker';
import FileUpload from './FileUpload/FileUpload';

/**
 * FormBuilder - Component xây dựng form động dựa trên cấu hình
 */
const FormBuilder = ({
  fields,
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  setFieldValue,
  handleSubmit,
  isSubmitting,
  title,
  subtitle,
  submitText = 'Lưu',
  cancelText = 'Hủy',
  onCancel,
  gridSpacing = 2,
  gridXs = 12,
  gridSm = 6,
  paperProps = {},
  isMultiStep = false,
  currentStep = 0,
  stepTitles = [],
  onNextStep,
  onPrevStep,
  isLastStep = false,
}) => {
  // Lọc fields theo step hiện tại nếu form nhiều bước
  const currentFields = isMultiStep
    ? fields.filter((field) => field.step === currentStep)
    : fields;

  // Render field dựa vào loại
  const renderField = (field) => {
    const {
      name,
      type,
      label,
      placeholder,
      helperText,
      options,
      required,
      disabled,
      fullWidth = true,
      xs = gridXs,
      sm = gridSm,
      md,
      lg,
      multiple,
      maxFiles,
      acceptedFiles,
      // Các thuộc tính riêng của từng loại field
      ...rest
    } = field;

    // Lấy thông tin validation
    const error = errors && errors[name];
    const isTouched = touched && touched[name];
    const showError = Boolean(error && isTouched);
    const fieldHelperText = showError ? error : helperText;

    // Các props chung cho tất cả các loại field
    const commonProps = {
      id: name,
      name,
      label,
      placeholder,
      value: values[name],
      onChange: handleChange,
      onBlur: handleBlur,
      error: showError,
      helperText: fieldHelperText,
      required,
      disabled: disabled || isSubmitting,
      fullWidth,
      ...rest,
    };

    // Render field tương ứng với từng loại
    switch (type) {
      case 'text':
      case 'email':
      case 'password':
      case 'number':
      case 'tel':
        return <TextField {...commonProps} type={type} />;

      case 'select':
        return <SelectField {...commonProps} options={options} multiple={multiple} />;

      case 'date':
        return <DatePicker {...commonProps} setFieldValue={setFieldValue} />;

      case 'file':
        return (
          <FileUpload
            {...commonProps}
            setFieldValue={setFieldValue}
            multiple={multiple}
            maxFiles={maxFiles}
            acceptedFiles={acceptedFiles}
          />
        );

      default:
        return <TextField {...commonProps} />;
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }} {...paperProps}>
      {(title || subtitle) && (
        <Box sx={{ mb: 3 }}>
          {title && (
            <Typography variant="h5" component="h2" gutterBottom>
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      )}

      {isMultiStep && stepTitles.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={1} alignItems="center">
            {stepTitles.map((stepTitle, index) => (
              <React.Fragment key={index}>
                <Grid item>
                  <Paper
                    elevation={0}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      bgcolor: index === currentStep ? 'primary.main' : 'grey.300',
                      color: index === currentStep ? 'primary.contrastText' : 'text.primary',
                    }}
                  >
                    <Typography variant="body2" component="span">
                      {index + 1}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item>
                  <Typography
                    variant="body2"
                    color={index === currentStep ? 'primary.main' : 'text.secondary'}
                    fontWeight={index === currentStep ? 'medium' : 'normal'}
                  >
                    {stepTitle}
                  </Typography>
                </Grid>
                {index < stepTitles.length - 1 && (
                  <Grid item xs>
                    <Box
                      sx={{
                        height: 1,
                        bgcolor: 'grey.300',
                      }}
                    />
                  </Grid>
                )}
              </React.Fragment>
            ))}
          </Grid>
        </Box>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={gridSpacing}>
          {currentFields.map((field) => (
            <Grid
              item
              key={field.name}
              xs={field.xs || gridXs}
              sm={field.sm || gridSm}
              md={field.md}
              lg={field.lg}
            >
              {renderField(field)}
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          {onCancel && (
            <Button variant="outlined" color="inherit" onClick={onCancel} disabled={isSubmitting}>
              {cancelText}
            </Button>
          )}

          {isMultiStep ? (
            <>
              {currentStep > 0 && (
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={onPrevStep}
                  disabled={isSubmitting}
                >
                  Quay lại
                </Button>
              )}
              <Button
                variant="contained"
                color="primary"
                onClick={isLastStep ? handleSubmit : onNextStep}
                disabled={isSubmitting}
              >
                {isLastStep ? submitText : 'Tiếp tục'}
              </Button>
            </>
          ) : (
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
            >
              {submitText}
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

FormBuilder.propTypes = {
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      placeholder: PropTypes.string,
      helperText: PropTypes.string,
      options: PropTypes.array,
      required: PropTypes.bool,
      disabled: PropTypes.bool,
      fullWidth: PropTypes.bool,
      xs: PropTypes.number,
      sm: PropTypes.number,
      md: PropTypes.number,
      lg: PropTypes.number,
      step: PropTypes.number,
      multiple: PropTypes.bool,
      maxFiles: PropTypes.number,
      acceptedFiles: PropTypes.string,
    })
  ).isRequired,
  values: PropTypes.object.isRequired,
  errors: PropTypes.object,
  touched: PropTypes.object,
  handleChange: PropTypes.func.isRequired,
  handleBlur: PropTypes.func.isRequired,
  setFieldValue: PropTypes.func,
  handleSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  submitText: PropTypes.string,
  cancelText: PropTypes.string,
  onCancel: PropTypes.func,
  gridSpacing: PropTypes.number,
  gridXs: PropTypes.number,
  gridSm: PropTypes.number,
  paperProps: PropTypes.object,
  isMultiStep: PropTypes.bool,
  currentStep: PropTypes.number,
  stepTitles: PropTypes.arrayOf(PropTypes.string),
  onNextStep: PropTypes.func,
  onPrevStep: PropTypes.func,
  isLastStep: PropTypes.bool,
};

export default FormBuilder;
