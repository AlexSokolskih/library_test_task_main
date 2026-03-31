import { setSeederFactory } from 'typeorm-extension';
import { faker } from '@faker-js/faker';
import { DocumentDescription } from '../../document-description/document-description.entity';

export default setSeederFactory(DocumentDescription, () => {
  const doc = new DocumentDescription();
  doc.uuid = faker.string.uuid();
  doc.reg_number = faker.string.numeric(10);
  doc.author = faker.person.fullName().slice(0, 200);
  doc.title = faker.lorem.sentence(6).slice(0, 500);
  doc.imprint = `${faker.location.city()}: ${faker.company.name()}, ${faker.date.past({ years: 10 }).getFullYear()}. ${faker.number.int({ min: 120, max: 900 })} p.`
    .replace(/\s+/g, ' ')
    .slice(0, 300);
  return doc;
});
