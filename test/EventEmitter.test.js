
import EventEmitter from '../src/EventEmitter/index';

const eventEmitter = new EventEmitter;

eventEmitter.once('test', () => {
    console.log('------')
});

eventEmitter.emit('test')
eventEmitter.emit('test')