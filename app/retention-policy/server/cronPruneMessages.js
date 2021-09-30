import { SyncedCron } from 'meteor/littledata:synced-cron';

import { SettingsVersion4 } from '../../settings/server/Settingsv4';
import { Rooms } from '../../models/server';
import { cleanRoomHistory } from '../../lib';

let types = [];

const oldest = new Date('0001-01-01T00:00:00Z');

const maxTimes = {
	c: 0,
	p: 0,
	d: 0,
};

const toDays = (d) => d * 1000 * 60 * 60 * 24;

function job() {
	const now = new Date();
	const filesOnly = SettingsVersion4.get('RetentionPolicy_FilesOnly');
	const excludePinned = SettingsVersion4.get('RetentionPolicy_DoNotPrunePinned');
	const ignoreDiscussion = SettingsVersion4.get('RetentionPolicy_DoNotPruneDiscussion');
	const ignoreThreads = SettingsVersion4.get('RetentionPolicy_DoNotPruneThreads');

	// get all rooms with default values
	types.forEach((type) => {
		const maxAge = maxTimes[type] || 0;
		const latest = new Date(now.getTime() - toDays(maxAge));

		Rooms.find({
			t: type,
			$or: [
				{ 'retention.enabled': { $eq: true } },
				{ 'retention.enabled': { $exists: false } },
			],
			'retention.overrideGlobal': { $ne: true },
		}, { fields: { _id: 1 } }).forEach(({ _id: rid }) => {
			cleanRoomHistory({ rid, latest, oldest, filesOnly, excludePinned, ignoreDiscussion, ignoreThreads });
		});
	});

	Rooms.find({
		'retention.enabled': { $eq: true },
		'retention.overrideGlobal': { $eq: true },
		'retention.maxAge': { $gte: 0 },
	}).forEach((room) => {
		const { maxAge = 30, filesOnly, excludePinned, ignoreThreads } = room.retention;
		const latest = new Date(now.getTime() - toDays(maxAge));
		cleanRoomHistory({ rid: room._id, latest, oldest, filesOnly, excludePinned, ignoreDiscussion, ignoreThreads });
	});
}

function getSchedule(precision) {
	switch (precision) {
		case '0':
			return '*/30 * * * *'; // 30 minutes
		case '1':
			return '0 * * * *'; // hour
		case '2':
			return '0 */6 * * *'; // 6 hours
		case '3':
			return '0 0 * * *'; // day
	}
}

const pruneCronName = 'Prune old messages by retention policy';

function deployCron(precision) {
	const schedule = (parser) => parser.cron(precision);

	SyncedCron.remove(pruneCronName);
	SyncedCron.add({
		name: pruneCronName,
		schedule,
		job,
	});
}

SettingsVersion4.watchMultiple(['RetentionPolicy_Enabled',
	'RetentionPolicy_AppliesToChannels',
	'RetentionPolicy_AppliesToGroups',
	'RetentionPolicy_AppliesToDMs',
	'RetentionPolicy_MaxAge_Channels',
	'RetentionPolicy_MaxAge_Groups',
	'RetentionPolicy_MaxAge_DMs',
	'RetentionPolicy_Advanced_Precision',
	'RetentionPolicy_Advanced_Precision_Cron',
	'RetentionPolicy_Precision'], function reloadPolicy() {
	types = [];

	if (!SettingsVersion4.get('RetentionPolicy_Enabled')) {
		return SyncedCron.remove(pruneCronName);
	}
	if (SettingsVersion4.get('RetentionPolicy_AppliesToChannels')) {
		types.push('c');
	}

	if (SettingsVersion4.get('RetentionPolicy_AppliesToGroups')) {
		types.push('p');
	}

	if (SettingsVersion4.get('RetentionPolicy_AppliesToDMs')) {
		types.push('d');
	}

	maxTimes.c = SettingsVersion4.get('RetentionPolicy_MaxAge_Channels');
	maxTimes.p = SettingsVersion4.get('RetentionPolicy_MaxAge_Groups');
	maxTimes.d = SettingsVersion4.get('RetentionPolicy_MaxAge_DMs');


	const precision = (SettingsVersion4.get('RetentionPolicy_Advanced_Precision') && SettingsVersion4.get('RetentionPolicy_Advanced_Precision_Cron')) || getSchedule(SettingsVersion4.get('RetentionPolicy_Precision'));

	return deployCron(precision);
});
