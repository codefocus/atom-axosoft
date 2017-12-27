'use babel';

export default class AxosoftSerializer {

    static deserialize(input) {
        console.log('deserialize(input)');
        console.log(input);
        // return '';
        return atom.deserializers.deserialize(input);
    }

};
