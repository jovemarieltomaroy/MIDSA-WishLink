import User from '../models/User.js';

export async function changePassword(req, res) {
  const {
    currentPassword,
    newPassword
  } = req.body;

  if (
    !currentPassword ||
    !newPassword
  ) {
    return res
      .status(400)
      .json({
        message:
          'Current password and new password are required.'
      });
  }

  if (
    String(newPassword).length < 8
  ) {
    return res
      .status(400)
      .json({
        message:
          'New password must be at least 8 characters long.'
      });
  }

  const user =
    await User.findById(
      req.user._id
    ).select('+password');

  if (!user) {
    return res
      .status(404)
      .json({
        message:
          'Account could not be found.'
      });
  }

  const passwordIsCorrect =
    await user.comparePassword(
      currentPassword
    );

  if (!passwordIsCorrect) {
    return res
      .status(400)
      .json({
        message:
          'Your current password is incorrect.'
      });
  }

  const sameAsCurrent =
    await user.comparePassword(
      newPassword
    );

  if (sameAsCurrent) {
    return res
      .status(400)
      .json({
        message:
          'Your new password must be different from your current password.'
      });
  }

  /*
   * Your User model's pre-save hook
   * automatically hashes this new password.
   */
  user.password =
    newPassword;

  await user.save();

  return res.json({
    message:
      'Password changed successfully.'
  });
}