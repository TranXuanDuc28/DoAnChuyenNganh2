const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    res.json(notifications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.markRead = async (req, res) => {
  try {
    const { notificationIds } = req.body;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({ msg: 'Please provide an array of notification IDs.' });
    }

    await Notification.update(
      { isRead: true },
      {
        where: {
          id: notificationIds,
          userId: req.user.id
        }
      }
    );

    res.json({ msg: 'Notifications marked as read.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
