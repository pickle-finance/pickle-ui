#import "AFXInstallerUtilities.h"
#import "AFXCurrentInstallerInfo.h"
@import ObjCTools;
@import SetappInterface.AFXGlobals;

#pragma mark - Public

NSURL *AFXGetZipDownloadURL(void)
{
    return [NSURL URLWithString:@"%{INSTALLER_ZIP_DL_URL}"];
}

NSURL *AFXGetDmgDownloadURL(void)
{
    return [NSURL URLWithString:@"%{INSTALLER_DMG_DL_URL}"];
}

NSString *AFXGetProductName(void)
{
  return @"%{PRODUCT_NAME}";
}
