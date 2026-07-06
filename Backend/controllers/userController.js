import userService from "../services/userService.js";

//Get user profile with their posts
export const getUserProfile = async (req, res) => {
    const { username } = req.params;
    const profileData = await userService.getUserProfileService(username, req.user?.id);
    res.status(200).json({
        success: true,
        message: "User and posts found",
        data: profileData
    });
};

//Update user profile (bio, username, fullname, email, etc.)
export const updateProfile = async (req, res) => {
    const user = await userService.updateProfileService(req.user.id, req.body);
    res.status(200).json({ success: true, message: 'Profile updated successfully', data: user });
};

// Upload or update profile picture
export const uploadProfilePic = async (req, res) => {
    const user = await userService.uploadProfilePicService(req.user.id, req.file);
    res.status(200).json({ success: true, message: 'Profile image updated successfully', data: user });
};

//Follow another user
export const followUser = async (req, res) => {
    await userService.followUserService(req.params.id, req.user.id);
    res.status(200).json({ success: true, message: 'User followed successfully' });
};

//Unfollow a user
export const unfollowUser = async (req, res) => {
    await userService.unfollowUserService(req.params.id, req.user.id);
    res.status(200).json({ success: true, message: 'User unfollowed successfully' });
};

//Get followers list of a user
export const getFollowers = async (req, res) => {
    const payload = await userService.getFollowersService(req.params.id, req.user?.id, req.query.page, req.query.limit);
    res.status(200).json({ success: true, message: 'Followers fetched successfully', data: payload });
};

//Get following list of a user
export const getFollowing = async (req, res) => {
    const payload = await userService.getFollowingService(req.params.id, req.user?.id, req.query.page, req.query.limit);
    res.status(200).json({ success: true, message: 'Following fetched successfully', data: payload });
};