import some from 'lodash/some';
import { StaticNetworkLocationResource, TaskResource } from 'kolibri.resources';
import { createTranslator } from 'kolibri.utils.i18n';

// Strings that might be shared among syncing-related UIs across plugins.
// See taskStrings mixin for strings relating to the Facility-Syncing Async Task.
const syncStrings = createTranslator('CommonSyncStrings', {
  selectSourceTitle: {
    message: 'Select a source',
    context: 'Title of menu where the user selects the source from where to import a facility',
  },
  selectNetworkAddressTitle: {
    message: 'Select network address',
    context:
      'Title of menu where user selects a device at an address in order to communicate with it',
  },
  newAddressTitle: {
    message: 'New address',
    context:
      'Title of the menu where the user manually adds a new device address from where to import a facility',
  },
  addNewAddressAction: {
    message: 'Add new address',
    context: 'Label for a button that open menu to save a new network address',
  },
  selectFacilityTitle: {
    message: 'Select facility',
    context:
      'Title of the modal window where the user selects a facility to import from the source device',
  },
  adminCredentialsTitle: {
    message: 'Enter admin credentials',
    context: 'Title of the menu where the user provides credentials before importing facility',
  },
  nameWithIdFragment: {
    message: '{name} ({id})',
    context: 'Template for strings of the form "Name (1234)"',
  },
  importFacilityAction: {
    message: 'Import facility',
    context: 'Label for a button used to import a facility on the device',
  },
  distinctFacilityNameExplanation: {
    message: "This facility is different from '{facilities}'. These facilities will not sync.",
    context:
      'When two facilities have the same name but different IDs, they will not be able to sync',
  },
});

export default {
  methods: {
    getCommonSyncString(...args) {
      return syncStrings.$tr(...args);
    },
    formatNameAndId(name, id) {
      // TODO switch to using the last 4 characters
      return this.getCommonSyncString('nameWithIdFragment', { name, id: id.slice(0, 4) });
    },
    createStaticNetworkLocation({ base_url, device_name }) {
      return StaticNetworkLocationResource.createModel({
        base_url,
        nickname: device_name,
      }).save();
    },
    startKdpSyncTask(facilityId) {
      return TaskResource.dataportalsync(facilityId).then(response => {
        return response.data;
      });
    },
    fetchKdpSyncTasks() {
      return TaskResource.fetchCollection({ force: true }).then(tasks => {
        return tasks.filter(task => (task.type = 'SYNCDATAPORTAL'));
      });
    },
    cleanupKdpSyncTasks(tasks, cb) {
      if (some(tasks, { type: 'SYNCDATAPORTAL', status: 'COMPLETED' })) {
        return TaskResource.deleteFinishedTasks().then(() => {
          if (cb) {
            cb();
          }
        });
      }
    },
  },
};
