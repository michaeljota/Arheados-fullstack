'use strict';

describe('Service: drawSyncManager', function () {

  // load the service's module
  beforeEach(module('arheadosFullstackApp'));

  // instantiate service
  var drawManager;
  beforeEach(inject(function (_drawManager_) {
    drawManager = _drawManager_;
  }));

  it('should do something', function () {
    expect(!!drawManager).toBe(true);
  });

});
