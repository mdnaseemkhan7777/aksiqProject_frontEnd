import { aksiqProjectTemplatePage } from './app.po';

describe('aksiqProject App', function() {
  let page: aksiqProjectTemplatePage;

  beforeEach(() => {
    page = new aksiqProjectTemplatePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
