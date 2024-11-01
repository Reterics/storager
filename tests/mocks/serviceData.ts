import {ServiceCompleteData, ServiceData} from "../../src/interfaces/interfaces";


export const serviceDataList:ServiceData[] = [
    {
        id: '00016',
        client_name: 'Kovács János',
        client_email: 'kovacs.janos@gmail.com',
        client_phone: '063333333',
        service_name: 'Test Service',
        service_address: 'Test Address',
        service_email: 'email@test.com',
        type: 'type',
        accessories: 'accessories',
        guaranteed: "yes",
        repair_description: "description <br>\ndescription <br>\ndescription <br>\ndescription <br>\ndescription <br>\ndescription <br>\ndescription <br>\ndescription <br>\ndescription <br>\ndescription <br>\ndescription <br>\ndescription <br>\ndescription <br>\n",
        expected_cost: '5000',
        note: 'note',
        address: 'address',
        phone: '06300000',
        description: 'description',
        coordinates: undefined,
        serviceStatus: 'status_accepted',
        signature: '',
        date: '2022-02-02',
        onUpdate: true
    }
];

export const serviceCompletionDataList: ServiceCompleteData[] = [
    {
        id: '00016_cd',
        service_id: '00016',
        service_date: '2022-02-02',
        date: new Date().toISOString().split('T')[0],
        service_address: 'Test Address',
        service_name: 'Test Service',
        service_email: 'email@test.com',
        client_name: 'Kovács János',
        client_email: 'kovacs.janos@gmail.com',
        client_phone: '063333333',
        type: 'type',
        accessories: 'accessories',
        repair_cost: '5000',
        guaranteed: 'no',
        repair_description: 'description'
    }
];
