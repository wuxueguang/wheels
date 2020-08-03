
import EventEmitter from '../EventEmitter/index';

const eventEmitter = new EventEmitter;

eventEmitter.once('test', () => {
    console.log('------')
});

eventEmitter.emit('test')